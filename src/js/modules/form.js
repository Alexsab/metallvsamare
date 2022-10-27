let $$$ = function (name) { return document.querySelector(name) },
$$ = function (name) { return document.querySelectorAll(name) };

function maskphone(e) {
	let num = this.value.replace('+7', '').replace(/\D/g, '').split(/(?=.)/), i = num.length;
	if (0 <= i) num.unshift('+7');
	if (1 <= i) num.splice(1, 0, ' ');
	if (4 <= i) num.splice(5, 0, ' ');
	if (7 <= i) num.splice(9, 0, '-');
	if (9 <= i) num.splice(12, 0, '-');
	if (11 <= i) num.splice(15, num.length - 15);
	this.value = num.join('');
	if (num.length == 1 && num[0] == "") {
		this.parentElement.querySelector('small').classList.remove('hidden');
		this.parentElement.querySelector('small').innerText = 'Поле обязательно для заполнения';
		return;
	} else if(num.length != 15 || [... new Set(num)].length == 1) {
		this.parentElement.querySelector('small').classList.remove('hidden');
		this.parentElement.querySelector('small').innerText = 'Некорректный номер телефона';
		return;
	}
	this.parentElement.querySelector('small').classList.add('hidden');
};

$$("input[name=phone]").forEach(function (element) {
	element.addEventListener('focus', maskphone);
	element.addEventListener('input', maskphone);
});

$$("input[name=agree]").forEach(function (element) {
	let mes = element.parentElement.parentElement.querySelector('small')
	element.addEventListener('change', e => {
		if(!e.target.checked){
			mes.classList.remove('hidden')
		}else{
			mes.classList.add('hidden')
		}
	});
});

const titleModal = document.querySelector('#response_modal h3');
const textModal = document.querySelector('#response_modal .content p');
const successArr = ['Спасибо!', 'Ваша заявка успешно отправлена!'];
const errorArr = ["Ошибка", "Перезагрузите страницу и попробуйте снова"];

function getCookie(name) {
	var matches = document.cookie.match(new RegExp(
	"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	))
	return matches ? decodeURIComponent(matches[1]) : undefined
}

function showErrorMes(form, el, text){
	let field = form.querySelector(el);
	field.querySelector('small').innerText = text;
	field.querySelector('small').classList.remove('hidden');
}

document.querySelectorAll("form").forEach(function(form) {
	var btn = form.querySelector('button');

	form.addEventListener('submit', async function(e) {
		e.preventDefault();

		var formData = new FormData(form);
		const params = new URLSearchParams([...new FormData(e.target).entries()]);

		if(e.target.classList.contains('has-error')) {
			return false;
		}

		if(getCookie('fta')) {
			formData.append("fta", true);
		}

		var url = window.location.href;
		var replUrl = url.replace('?', '&');
		btn.innerHTML = 'Отправляем...';
		btn.setAttribute('disabled', true);

		formData.append("page_name", document.title);
		formData.append("page_url", window.location.origin + window.location.pathname);

		window.location.search.slice(1).split("&").forEach(function(pair) {
			var param = pair.split("=");
			formData.append(param[0], param[1]);
		});
		if(getCookie('__gtm_campaign_url')) {
			var source = new URL(getCookie('__gtm_campaign_url'));
			source.search.slice(1).split("&").forEach(function(pair) {
				var param = pair.split("=");
				formData.append(param[0], param[1]);
			});
		}
		for (const pair of formData) {
			params.append(pair[0], pair[1]);
		}

		// fetch('https://diywebdev.ru/lead/dev/', {
		fetch('https://alexsab.ru/lead/metallvsamare/', {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: params,
		})
		.then(res => res.json())
		.then(await function(data){
			btn.innerHTML = 'Отправить';
			btn.removeAttribute('disabled');
			if (data.answer == 'required') {
				showErrorMes(form, data.field, data.message);
				return;
			}
			form.reset();
			Alpine.store('state').isModalOpen = false;
			titleModal.innerText = successArr[0];
			textModal.innerText = successArr[1];
			Alpine.store('state').isResponseModalOpen = true;
		})
		.catch(await function(error) {
			console.error("Ошибка отправки данных формы: " + error);
			btn.innerHTML = 'Отправить';
			btn.removeAttribute('disabled');
			Alpine.store('state').isModalOpen = false;
			titleModal.innerText = errorArr[0];
			textModal.innerText = errorArr[1];
			Alpine.store('state').isResponseModalOpen = true;
		});
		return false;
	});
});
