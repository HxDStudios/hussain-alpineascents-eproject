$(document).ready(function () {
  initNavigation();
  initKnowledgeTabs();
  initVisitorCounter();
  initAcclimatizationCalc();
  initClubFilter();
  initBookingForm();
  initLeafletMap();
  initTicker();
  initAboutCardModal();
  initContactForm();
});

function initNavigation() {
  $('#menu-button').on('click', function (e) {
    e.stopPropagation();
    const $drawer = $('#mobile-menu');
    $drawer.toggleClass('open');
    const isOpen = $drawer.hasClass('open');
    $(this).find('i').toggleClass('fa-bars', !isOpen).toggleClass('fa-xmark', isOpen);
  });

  $(document).on('click', function (e) {
    if (!$(e.target).closest('.navbar').length) {
      $('#mobile-menu').removeClass('open');
      $('#menu-button').find('i').removeClass('fa-xmark').addClass('fa-bars');
    }
  });
}

function initKnowledgeTabs() {
  $('.tab-btn').on('click', function () {
    $('.tab-btn').removeClass('active-tab');
    $(this).addClass('active-tab');

    const tabKey = $(this).data('tab');
    const tabMap = {
      'styles': 'styles-tab',
      'history': 'history-tab',
      'techniques': 'skills-tab',
      'shelters': 'shelters-tab',
      'hazards': 'safety-tab',
      'records': 'records-tab'
    };
    const targetId = tabMap[tabKey] || (tabKey + '-tab');
    $('.tab-content').hide();
    $('#' + targetId).fadeIn(200);
  });
}

function initVisitorCounter() {
  let count = parseInt(localStorage.getItem('alpine_visitor_count'), 10);
  if (!count || isNaN(count)) {
    count = 1482;
  }
  count++;
  localStorage.setItem('alpine_visitor_count', count);
  $('#visitor-counter, #mobile-counter').text(count.toLocaleString());
}

function initAcclimatizationCalc() {
  $('#calculate-btn').on('click', function () {
    const currentAlt = parseInt($('#start-height').val(), 10) || 4800;
    const targetAlt = parseInt($('#target-height').val(), 10) || 7100;

    if (targetAlt <= currentAlt) {
      $('#result-title').text('Ascent Target Invalid');
      $('#result-text').html('Target altitude must be higher than current altitude.');
      $('#result-box').fadeIn();
      return;
    }

    const elevationGain = targetAlt - currentAlt;
    const recommendedDays = Math.ceil(elevationGain / 300);
    const restDays = Math.floor(recommendedDays / 3);
    const totalExpeditionDays = recommendedDays + restDays;

    $('#result-title').text('Ascent Profile: +' + elevationGain + 'm Net Gain');
    $('#result-text').html(
      '<div class="mb-1"><strong>Required Acclimatization Window:</strong> ' + recommendedDays + ' staging days</div>' +
      '<div class="mb-1"><strong>Mandatory Biological Rest Ceilings:</strong> ' + restDays + ' non-ascent days</div>' +
      '<div><strong>Total Projected Window:</strong> ' + totalExpeditionDays + ' days to high summit push safely without HAPE/HACE escalation.</div>'
    );
    $('#result-box').fadeIn();
  });
}

function initClubFilter() {
  function applyFiltersAndSort() {
    const searchVal = ($('#club-search').val() || '').toLowerCase().trim();
    const regionVal = $('#region-filter').val() || 'all';
    const gradeVal = $('#grade-filter').val() || 'all';
    const sortVal = $('#sort-filter').val() || 'default';

    const cards = $('.federation-card').toArray();

    cards.forEach(function (card) {
      const $card = $(card);
      const text = $card.text().toLowerCase();
      const cardRegion = $card.attr('data-region') || '';
      const cardGrade = $card.attr('data-grade') || '';

      const matchSearch = !searchVal || text.indexOf(searchVal) !== -1;
      const matchRegion = regionVal === 'all' || cardRegion === regionVal;
      const matchGrade = gradeVal === 'all' || cardGrade === gradeVal;

      if (matchSearch && matchRegion && matchGrade) {
        $card.show();
      } else {
        $card.hide();
      }
    });

    if (sortVal !== 'default') {
      cards.sort(function (a, b) {
        const $a = $(a);
        const $b = $(b);
        if (sortVal === 'name-asc') return ($a.attr('data-name') || '').localeCompare($b.attr('data-name') || '');
        if (sortVal === 'name-desc') return ($b.attr('data-name') || '').localeCompare($a.attr('data-name') || '');
        if (sortVal === 'year-asc') return (parseInt($a.attr('data-year'), 10) || 0) - (parseInt($b.attr('data-year'), 10) || 0);
        if (sortVal === 'year-desc') return (parseInt($b.attr('data-year'), 10) || 0) - (parseInt($a.attr('data-year'), 10) || 0);
        return 0;
      });
    }

    const $list = $('#clubs-list');
    cards.forEach(function (card) {
      $list.append(card);
    });
  }

  $('#club-search').on('input keyup', applyFiltersAndSort);
  $('#region-filter, #grade-filter, #sort-filter').on('change', applyFiltersAndSort);
}

function initBookingForm() {
  $('#booking-form').on('submit', function (e) {
    e.preventDefault();
    $('#success-message').fadeIn();
    setTimeout(function () {
      $('#success-message').fadeOut();
      bootstrap.Modal.getInstance(document.getElementById('booking-modal')).hide();
      $('#booking-form')[0].reset();
    }, 3000);
  });
}

function initLeafletMap() {
  const mapElement = document.getElementById('main-map');
  if (!mapElement || typeof L === 'undefined') return;

  const map = L.map('main-map', {
    attributionControl: false,
    scrollWheelZoom: false
  }).setView([32, 35], 2);

  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 17
  });

  const terrainLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 17
  });

  satelliteLayer.addTo(map);

  $('#layer-filter').on('change', function () {
    const selected = $(this).val();
    if (selected === 'terrain') {
      map.removeLayer(satelliteLayer);
      terrainLayer.addTo(map);
    } else {
      map.removeLayer(terrainLayer);
      satelliteLayer.addTo(map);
    }
  });

  const clubs = [
    { name: "Alpine Club of Pakistan", city: "Islamabad", country: "Pakistan", lat: 35.8825, lon: 76.5133, region: "Karakoram", grade: "V+", focus: "K2 & Baltoro Glacier Range" },
    { name: "The Alpine Club", city: "London", country: "United Kingdom", lat: 51.5273, lon: -0.0825, region: "Alps", grade: "Speed", focus: "Global Exploratory Alpinism" },
    { name: "American Alpine Club", city: "Golden, CO", country: "United States", lat: 39.7555, lon: -105.2211, region: "Americas", grade: "Expedition", focus: "Denali & Cascade Range" },
    { name: "Club Alpin Français", city: "Paris / Chamonix", country: "France", lat: 45.9237, lon: 6.8694, region: "Alps", grade: "Speed", focus: "Mont Blanc Massif Refuges" },
    { name: "The Himalayan Club", city: "Mumbai / Kathmandu", country: "India / Nepal", lat: 27.7172, lon: 85.3240, region: "Himalayas", grade: "Expedition", focus: "Everest & Eastern Himalayas" },
    { name: "Swiss Alpine Club (SAC)", city: "Bern / Zermatt", country: "Switzerland", lat: 46.9480, lon: 7.4474, region: "Alps", grade: "V+", focus: "Matterhorn & Rega Air Rescue" },
    { name: "Club Alpino Italiano (CAI)", city: "Milan / Courmayeur", country: "Italy", lat: 45.4642, lon: 9.1900, region: "Alps", grade: "V+", focus: "Dolomites & Gran Paradiso" },
    { name: "Japan Mountaineering Association", city: "Tokyo", country: "Japan", lat: 35.6895, lon: 139.6917, region: "Japan", grade: "Expedition", focus: "Japanese Northern Alps & Fuji" }
  ];

  const regionCenters = {
    'all': { coords: [32, 35], zoom: 2 },
    'Himalayas': { coords: [27.9881, 86.9250], zoom: 6 },
    'Karakoram': { coords: [35.8825, 76.5133], zoom: 6 },
    'Alps': { coords: [45.9237, 6.8694], zoom: 6 },
    'Americas': { coords: [39.7555, -105.2211], zoom: 5 },
    'Japan': { coords: [35.6895, 139.6917], zoom: 6 }
  };

  const markers = [];

  clubs.forEach(function (c) {
    const marker = L.marker([c.lat, c.lon]).addTo(map);
    marker.bindPopup(
      '<div style="font-family: var(--font-sans); padding: 4px;">' +
      '<strong style="font-family: var(--font-serif); font-size: 1.05rem; color: #f8fafc; display: block; margin-bottom: 4px;">' + c.name + '</strong>' +
      '<span style="font-size: 0.8rem; color: #fbbf24; display: block; margin-bottom: 4px;">' + c.focus + '</span>' +
      '<span style="font-size: 0.75rem; color: #94a3b8;">' + c.city + ', ' + c.country + ' (' + c.lat.toFixed(2) + '°, ' + c.lon.toFixed(2) + '°)</span>' +
      '</div>'
    );
    markers.push({ data: c, marker: marker });
  });

  function updateMapMarkers() {
    const selectedRegion = $('#region-filter').val() || 'all';
    const selectedGrade = $('#grade-filter').val() || 'all';

    markers.forEach(function (item) {
      const matchRegion = selectedRegion === 'all' || item.data.region === selectedRegion;
      const matchGrade = selectedGrade === 'all' || item.data.grade === selectedGrade;

      if (matchRegion && matchGrade) {
        if (!map.hasLayer(item.marker)) {
          item.marker.addTo(map);
        }
      } else {
        if (map.hasLayer(item.marker)) {
          map.removeLayer(item.marker);
        }
      }
    });

    if (regionCenters[selectedRegion]) {
      const target = regionCenters[selectedRegion];
      map.flyTo(target.coords, target.zoom, { duration: 1.2 });
    }
  }

  $('#region-filter, #grade-filter').on('change', updateMapMarkers);

  $('.club-card').on('click', function () {
    const region = $(this).attr('data-region');
    if (region) {
      $('#region-filter').val(region).trigger('change');
    }
  });

  $('#club-search').on('input', function () {
    const val = $(this).val().toLowerCase().trim();
    if (val.length > 2) {
      for (let i = 0; i < markers.length; i++) {
        const item = markers[i];
        if (item.data.name.toLowerCase().indexOf(val) !== -1 ||
            item.data.focus.toLowerCase().indexOf(val) !== -1 ||
            item.data.country.toLowerCase().indexOf(val) !== -1) {
          map.flyTo([item.data.lat, item.data.lon], 6, { duration: 1.5 });
          item.marker.openPopup();
          break;
        }
      }
    }
  });

  window.addEventListener('resize', function () {
    map.invalidateSize();
  });
}

function initTicker() {
  function updateClock() {
    const now = new Date();
    $('#clock-time').text(now.toLocaleTimeString());
    $('#clock-date').text(now.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
  }
  updateClock();
  setInterval(updateClock, 1000);

  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const lat = pos.coords.latitude.toFixed(4);
        const lon = pos.coords.longitude.toFixed(4);
        $('#current-location').text(lat + '° N, ' + lon + '° E (HTML5 GPS)');
      },
      function () {
        $('#current-location').text('35.8825° N, 76.5133° E (Concordia / Godwin-Austen Confluence)');
      },
      { timeout: 4000 }
    );
  } else {
    $('#current-location').text('35.8825° N, 76.5133° E (Concordia / Godwin-Austen Confluence)');
  }
}

function handleSubscribe() {
  const email = $('#email-input').val().trim();
  if (email && email.indexOf('@') !== -1) {
    $('#subscribe-alert').fadeIn();
    $('#email-input').val('');
    setTimeout(function () {
      $('#subscribe-alert').fadeOut();
    }, 4000);
  }
}

function initAboutCardModal() {
  const modalEl = document.getElementById('card-modal');
  if (!modalEl) return;

  const bsModal = new bootstrap.Modal(modalEl);

  $('.gallery-card-item, .ethics-card').on('click', function () {
    const $this = $(this);
    const title = $this.attr('data-title') || $this.find('.gallery-photo-title').text() || $this.find('h3, h5').first().text() || 'Expedition Detail';
    const sub = $this.attr('data-sub') || $this.find('.gallery-photo-sub').text() || 'High-Altitude Focus';
    const desc = $this.attr('data-desc') || $this.find('.article-summary, p').first().text() || '';
    const range = $this.attr('data-range') || 'Alpine Ascent Corridor';
    const grade = $this.attr('data-grade') || 'UIAA Standard';
    const altitude = $this.attr('data-altitude') || 'High Summit Staging';
    const safety = $this.attr('data-safety') || 'Verified Expedition Ethics';
    const peak = $this.attr('data-peak') || '';

    const $img = $this.find('img');
    const imgSrc = $img.length ? $img.attr('src') : '';

    $('#modal-card-title').text(title);
    $('#modal-card-subtitle').text(sub);
    $('#modal-card-description').text(desc);

    $('#modal-meta-range span').text(range);
    $('#modal-meta-grade span').text(grade);
    $('#modal-meta-altitude span').text(altitude);
    $('#modal-meta-safety span').text(safety);

    if (imgSrc) {
      $('#modal-card-image').attr('src', imgSrc).attr('alt', title);
      $('#modal-card-media-box').show();
    } else {
      $('#modal-card-media-box').hide();
    }

    if (peak) {
      const cleanPeak = peak.replace(/\s*\([^\)]*\)/, '').trim();
      $('#modal-action-btn').show().text('Book ' + cleanPeak + ' Expedition').off('click').on('click', function () {
        bsModal.hide();
        setTimeout(function () {
          const bookingModalEl = document.getElementById('booking-modal');
          if (bookingModalEl) {
            $('#peak-dropdown').val(peak);
            new bootstrap.Modal(bookingModalEl).show();
          }
        }, 400);
      });
    } else {
      $('#modal-action-btn').hide();
    }

    bsModal.show();
  });
}

function initContactForm() {
  const $form = $('#expedition-contact-form');
  if (!$form.length) return;

  const $name = $('#contact-name');
  const $email = $('#contact-email');
  const $phone = $('#contact-phone');
  const $peak = $('#contact-peak');
  const $date = $('#contact-date');
  const $climbers = $('#contact-climbers');
  const $exp = $('#contact-experience');
  const $emergency = $('#contact-emergency');
  const $message = $('#contact-message');
  const $agreement = $('#contact-agreement');
  const $charCount = $('#char-count');

  $message.on('input keyup', function () {
    const len = $(this).val().length;
    $charCount.text(len);
    if (len >= 15 && len <= 500) {
      $charCount.removeClass('text-danger text-warning').addClass('text-emerald');
    } else {
      $charCount.removeClass('text-emerald').addClass('text-warning');
    }
  });

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const minDate = yyyy + '-' + mm + '-' + dd;
  $date.attr('min', minDate);

  function validateField($field, condition, $errEl) {
    if (condition) {
      $field.removeClass('is-invalid').addClass('is-valid');
      if ($errEl) $errEl.hide();
      return true;
    } else {
      $field.removeClass('is-valid').addClass('is-invalid');
      if ($errEl) $errEl.css('display', 'flex');
      return false;
    }
  }

  function validateName() {
    const v = $name.val().trim();
    return validateField($name, v.length >= 3 && v.length <= 50 && /^[a-zA-Z\s\.\'\-]+$/.test(v), $('#err-name'));
  }

  function validateEmail() {
    const v = $email.val().trim();
    return validateField($email, /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(v), $('#err-email'));
  }

  function validatePhone() {
    const v = $phone.val().trim();
    return validateField($phone, /^\+?[0-9\s\-\(\)]{10,18}$/.test(v), $('#err-phone'));
  }

  function validatePeak() {
    return validateField($peak, $peak.val() !== '', $('#err-peak'));
  }

  function validateDate() {
    const v = $date.val();
    return validateField($date, v && v >= minDate, $('#err-date'));
  }

  function validateClimbers() {
    const v = parseInt($climbers.val(), 10);
    return validateField($climbers, v >= 1 && v <= 12, $('#err-climbers'));
  }

  function validateExp() {
    return validateField($exp, $exp.val() !== '', $('#err-experience'));
  }

  function validateEmergency() {
    const v = $emergency.val().trim();
    return validateField($emergency, v.length >= 5 && v.length <= 70, $('#err-emergency'));
  }

  function validateMessage() {
    const v = $message.val().trim();
    return validateField($message, v.length >= 15 && v.length <= 500, $('#err-message'));
  }

  function validateAgreement() {
    const ok = $agreement.is(':checked');
    if (ok) {
      $('#err-agreement').hide();
    } else {
      $('#err-agreement').css('display', 'flex');
    }
    return ok;
  }

  $name.on('blur input', validateName);
  $email.on('blur input', validateEmail);
  $phone.on('blur input', validatePhone);
  $peak.on('change', validatePeak);
  $date.on('change blur', validateDate);
  $climbers.on('input change blur', validateClimbers);
  $exp.on('change', validateExp);
  $emergency.on('blur input', validateEmergency);
  $message.on('blur input', validateMessage);
  $agreement.on('change', validateAgreement);

  $form.on('submit', function (e) {
    e.preventDefault();

    const isAllValid = [
      validateName(),
      validateEmail(),
      validatePhone(),
      validatePeak(),
      validateDate(),
      validateClimbers(),
      validateExp(),
      validateEmergency(),
      validateMessage(),
      validateAgreement()
    ].every(Boolean);

    if (!isAllValid) {
      const $firstInvalid = $form.find('.is-invalid').first();
      if ($firstInvalid.length) {
        $firstInvalid.addClass('shake-error');
        setTimeout(function () {
          $firstInvalid.removeClass('shake-error');
        }, 500);
        $firstInvalid.focus();
      }
      return;
    }

    const randomRef = 'ALP-2026-' + Math.floor(1000 + Math.random() * 9000);
    $('#success-user-name').text($name.val().trim());
    $('#success-ref-code').text('#' + randomRef);

    $('#contact-success-box').fadeIn(300);
    $('html, body').animate({
      scrollTop: $('#contact-success-box').offset().top - 120
    }, 400);

    $form[0].reset();
    $form.find('.is-valid').removeClass('is-valid');
    $charCount.text('0').removeClass('text-emerald text-danger').addClass('text-warning');
  });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  } else if (id === 'info-page' || id === 'knowledge') {
    window.location.href = 'knowledge.html';
  }
}
window.scrollToSection = scrollToSection;
