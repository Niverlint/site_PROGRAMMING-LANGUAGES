(function () {
  'use strict';


  var WORD_RU = '[А-ЯЁ][а-яё]+(?:-[А-ЯЁ][а-яё]+)?';
  var WORD_EN = '[A-Z][a-z]+(?:-[A-Z][a-z]+)?';
  var FIO_RE = new RegExp('^(?:' + WORD_RU + '\\s' + WORD_RU + '\\s' + WORD_RU + '|' + WORD_EN + '\\s' + WORD_EN + '\\s' + WORD_EN + ')$');


  var PHONE_CHARS_RE = /^[\d\s()+-]+$/;
  var PHONE_RE = /^(?:(?:\+7| 8)\d{10}|\+996\d{9}|0\d{9})$/;


  var EMAIL_RE = /^[A-Za-z0-9]+(?:[._+-][A-Za-z0-9]+)*@(?:[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*\.)+[A-Za-z]{2,}$/;





  var rules = {
    fio: {
      check: function (value) {
        return FIO_RE.test(value.trim().replace(/\s+/g, ' '));
      },
      empty: 'Введите ФИО.',
      invalid: 'Нужны три заглавной буквы, например: Иванов Иван Иванович.'
    },
    phone: {
      check: function (value) {
        if (!PHONE_CHARS_RE.test(value)) { return false; }
        return PHONE_RE.test(value.replace(/[\s()-]/g, ''));
      },
      empty: 'Введите номер телефона.',
      invalid: 'Примеры: +996 555 123 456, 0555 123 456, +7 (900) 123-45-67.'
    },
    email: {
      check: function (value) {
        return EMAIL_RE.test(value.trim());
      },
      empty: 'Введите адрес почты.',
      invalid: 'Нужен адрес вида name@example.com.'
    }
  };

 

  var form = document.getElementById('contact-form');
  if (!form) { return; }

  var success = document.getElementById('form-success');

  function validateField(input) {
    var rule = rules[input.name];
    var error = document.getElementById(input.id + '-error');
    var value = input.value;
    var message = '';

    if (value.trim() === '') {
      message = rule.empty;
    } else if (!rule.check(value)) {
      message = rule.invalid;
    }

    error.textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    return message === '';
  }


  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];

    input.addEventListener('blur', function () {
      input.dataset.touched = 'true';
      validateField(input);
    });

    input.addEventListener('input', function () {
      success.hidden = true;
      if (input.dataset.touched === 'true') { validateField(input); }
    });
  });



  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.dataset.touched = 'true';
      if (!validateField(input) && !firstInvalid) { firstInvalid = input; }
    });

    if (firstInvalid) {
      success.hidden = true;
      firstInvalid.focus();
      return;
    }

    success.hidden = false;
    form.reset();
    Object.keys(rules).forEach(function (name) {
      delete form.elements[name].dataset.touched;
    });
  });
})();
