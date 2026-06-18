(function () {
    var header = document.querySelector('.site-header');
    var menuToggle = document.querySelector('.menu-toggle');
    var navPanel = document.getElementById('primary-menu');

    if (header && menuToggle && navPanel) {
        var closeMenu = function () {
            header.classList.remove('is-menu-open');
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Открыть меню');
        };

        menuToggle.addEventListener('click', function () {
            var isOpen = header.classList.toggle('is-menu-open');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            menuToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
        });

        navPanel.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMenu);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                closeMenu();
            }
        });
    }

    var form = document.querySelector('.lead-form');
    if (!form) {
        return;
    }

    var isStaticForm = form.dataset.staticForm === 'true';
    var status = form.querySelector('.form-status');
    var serviceSelect = form.querySelector('[name="service"]');
    var submitButton = form.querySelector('[type="submit"]');
    var requestBlock = document.getElementById('request');
    var params = new URLSearchParams(window.location.search);

    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (key) {
        var input = form.querySelector('[name="' + key + '"]');
        if (input && params.has(key)) {
            input.value = params.get(key).slice(0, 150);
        }
    });

    document.querySelectorAll('.service-cta').forEach(function (button) {
        button.addEventListener('click', function () {
            if (serviceSelect) {
                serviceSelect.value = button.dataset.service || '';
            }
            requestBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
            var phone = form.querySelector('[name="phone"]');
            if (phone) {
                window.setTimeout(function () {
                    phone.focus();
                }, 450);
            }
        });
    });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        status.textContent = '';
        status.className = 'form-status';

        if (!form.reportValidity()) {
            status.textContent = 'Проверьте обязательные поля: телефон, услуга и согласие.';
            status.classList.add('is-error');
            return;
        }

        if (isStaticForm) {
            status.textContent = 'Заявка не отправляется на демо-странице. Позвоните или напишите в WhatsApp.';
            status.classList.add('is-error');
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Отправляем...';
        status.textContent = 'Передаем заявку мастеру.';

        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                'X-Requested-With': 'fetch'
            }
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    return { ok: response.ok, data: data };
                });
            })
            .then(function (result) {
                status.textContent = result.data.message || 'Заявка обработана.';
                status.classList.add(result.ok && result.data.ok ? 'is-success' : 'is-error');
                if (result.ok && result.data.ok) {
                    form.reset();
                }
            })
            .catch(function () {
                status.textContent = 'Не удалось отправить заявку. Позвоните или напишите в WhatsApp.';
                status.classList.add('is-error');
            })
            .finally(function () {
                submitButton.disabled = false;
                submitButton.textContent = 'Отправить заявку';
            });
    });
})();
