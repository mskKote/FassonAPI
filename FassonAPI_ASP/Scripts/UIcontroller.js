
// HTTPS VS HTTP
window.addEventListener('DOMContentLoaded', function () {
    if (location.protocol == 'http:')
        location.protocol = 'https:';
});

/// ТЁМНАЯ ТЕМА /////////////////////////
window.addEventListener("DOMContentLoaded", function () {
    if (localStorage.darkTheme == "true") theme(true);
})
function theme(referred = false) {
    if (localStorage.darkTheme == undefined) localStorage.darkTheme = false;

    if (localStorage.darkTheme == "false" || referred) {
        localStorage.darkTheme = "true";
        document.getElementById("light").innerHTML = "Включить свет";
        document.getElementById("theme").setAttribute("href", "../Content/color_theme_dark.css");
    }
    else {
        localStorage.darkTheme = "false";
        document.getElementById("light").innerHTML = "Выключить свет";
        document.getElementById("theme").removeAttribute("href");
    }
}


/// РЕГИСТРАЦИЯ /////////////////////////
var R_itLogin = document.querySelector('input.Registration[name="Login"]');
var R_itPassword = document.querySelector('input.Registration[name="Password"]');
var R_itPassCheck = document.querySelector('input.Registration[name="PasswordCheck"]');
var btnReg = document.querySelector('#btnReg');
var R_btnFaceAPI = document.querySelector('#RegistrPortrait');

/// ПРИКРЕПЛЕНИЕ ПОРТРЕТА ///////////////
var CP_itLogin = document.querySelector('input.CreatePortrait[name="Login"]');
var CP_itPassword = document.querySelector('input.CreatePortrait[name="Password"]');
var CP_itPassCheck = document.querySelector('input.CreatePortrait[name="PasswordCheck"]');
var CP_btnFaceAPI = document.querySelector('#CreatePortrait');

/// АУТЕНТИФИКАЦИЯ //////////////////////
var A_itLogin = document.querySelector('input.Auth[name="Login"]');
var A_itPassword = document.querySelector('input.Auth[name="Password"]');
var btnAuth = document.querySelector('#btnAuth');
var A_btnFaceAPI = document.querySelector('#AuthPortrait');

/// УДАЛЕНИЕ АККАУНТА ///////////////////
var AD_itLogin = document.querySelector('input.AccDel[name="Login"]');
var AD_itPassword = document.querySelector('input.AccDel[name="Password"]');
var btnAccDel = document.querySelector('#btnAccDel');

/////////////////////////////////////////
disableElements([btnReg, R_btnFaceAPI, CP_btnFaceAPI, btnAuth, A_btnFaceAPI, btnAccDel], true);

subscribeInput([R_itLogin, R_itPassword, R_itPassCheck], changeRegister);
subscribeInput([CP_itLogin, CP_itPassword, CP_itPassCheck], changeCreatePortrait);
subscribeInput([A_itLogin, A_itPassword], changeAuth);
subscribeInput([AD_itLogin, AD_itPassword], changeAD);

// Функции для изменения текста.
function changeRegister() {
    loginCheck(R_itLogin);
    correctText([R_itLogin, R_itPassword, R_itPassCheck]);
    changeEnable([btnReg, R_btnFaceAPI], R_itPassword.value != R_itPassCheck.value
                                      || R_itLogin.value == ''
                                      || R_itPassword.value == ''
                                      || R_itPassCheck.value == '');
}
function changeCreatePortrait() {
    loginCheck(CP_itLogin);
    correctText([CP_itLogin, CP_itPassword, CP_itPassCheck]);
    changeEnable([CP_btnFaceAPI], CP_itPassword.value != CP_itPassCheck.value
                               || CP_itLogin.value == ''
                               || CP_itPassword.value == ''
                               || CP_itPassCheck.value == '');
}
function changeAuth() {
    loginCheck(A_itLogin);
    correctText([A_itLogin, A_itPassword]);
    changeEnable([btnAuth, A_btnFaceAPI], A_itLogin.value == '');
}
function changeAD() {
    loginCheck(AD_itLogin);
    correctText([AD_itLogin, AD_itPassword]);
    changeEnable([btnAccDel], AD_itLogin.value == '' || AD_itPassword.value == '');
}
function loginCheck(login) {
    while (login.value.indexOf('/') != -1)
        login.value = login.value.replace('/', '');
    if (login.value.length > 50) login.value = login.value.slice(0, 50);
}

function changeEnable(ElementsArr, Condition) {
    if (Condition)
        deleteCameraAfterAction();
    disableElements(ElementsArr, Condition);
}
function disableElements(ElementsArr, Condition) {
    ElementsArr.forEach(el => el.disabled = Condition);
}
function correctText(ElementsArr) {
    for (var i = 0; i < ElementsArr.length; i++)
        while (ElementsArr[i].value.indexOf(' ') != -1)
            ElementsArr[i].value = ElementsArr[i].value.replace(' ', '');
}
function subscribeInput(ElementsArr, func) {
    ElementsArr.forEach(el => el.addEventListener('input', func));
}

function changeTextValue(ElementsArr, str) {
    for (var i = 0; i < ElementsArr.length; i++)
        ElementsArr[i].value = str;
}

// Функции для камеры
function FrontFuncCam(a, b) { return function () { AddCameraAction(a, b) } };
const RegFunc = FrontFuncCam('RegistrPortrait', '/Index/RegFace/');
const CPFunc = FrontFuncCam('CreatePortrait', '/Index/LinkFacePortrait/');
const AuthFunc = FrontFuncCam('AuthPortrait', '/Index/AuthFace/');

R_btnFaceAPI.Type = 'Reg';
CP_btnFaceAPI.Type = 'CP';
A_btnFaceAPI.Type = 'Auth';

R_btnFaceAPI.addEventListener('click', RegFunc, false);
CP_btnFaceAPI.addEventListener('click', CPFunc, false);
A_btnFaceAPI.addEventListener('click', AuthFunc, false);

function Submit(Controller) {
    var Login = R_itLogin,
        Password = R_itPassword,
        Type = 'Registration';

    if (Controller == "/Index/Authentication/" || Controller == "/Index/AuthFace/") {
        Login = A_itLogin;
        Password = A_itPassword;
        Type = 'Authentication';
    }
    else if (Controller == "/Index/LinkFacePortrait/") {
        Login = CP_itLogin;
        Password = CP_itPassword;
        Type = 'Registration';
    }

    var reqData = `Login=${Login.value}&Password=${Password.value}`;

    if (Controller.includes("Face", 0))
        reqData += `&Face=${canvas.toDataURL('image/png')}`;

    Notify('Please, wait', '#ff8500', Elimination = false);
    $.ajax({
        async: true,
        type: 'POST',
        url: Controller,
        data: reqData,
        async: true,
        cache: false,
        processData: false,
        success: function (data) {
            var color = data == 'True' ? '#FF1493' : '#DC143C';

            if (Controller.includes("Face")) {
                document.getElementById('startbutton').classList.remove('waitEnd');

                if (data == 'True')
                    if (Type == 'Authentication')
                        data = "Correct portrait";
                    else data = "Registration success";
                BackToNormal();
            }
            else data = data == 'True' ? Type + " success" : data;

            console.log(data);
            document.getElementById('loading').classList.remove('is-active');
            Notify(data, color, Elimination = false);

            deleteCameraAfterAction();

            changeTextValue([R_itLogin, R_itPassword, R_itPassCheck,
                             CP_itLogin, CP_itPassword, CP_itPassCheck,
                             A_itLogin, A_itPassword,
                             AD_itLogin, AD_itPassword], "");

            changeCreatePortrait();
            changeRegister();
            changeAuth();
            changeAD();

            document.querySelectorAll("input").forEach(el => el.disabled = false);

            if (color == '#FF1493') // data was true
            {// Перезагружаю аккаунты, если регистрация
                if (Controller == "/Index/RegFace/" ||
                    Controller == "/Index/Registration/" ||
                    Controller == "/Index/LinkFacePortrait/") {
                        BackToNormalNotify();
                        Notify(data, color, Elimination = false);
                        document.querySelectorAll("input").forEach(el => el.disabled = true);
                        disableElements([btnReg, R_btnFaceAPI, CP_btnFaceAPI, btnAuth, A_btnFaceAPI, btnAccDel], true);
                        setTimeout(() => { Accounts(); }, 1250);
                }
            }

            try { document.querySelector(`button#${cameraPlaceID}`).disabled = true;} catch (e) {}
            setTimeout(() => { BackToNormalNotify(); }, 3500);
        },
        error: function (data, textStatus) {
            console.log(reqData);
            Notify(`ERROR`, '#DC143C', Elimination = false);
            document.getElementById('loading').classList.remove('is-active');
        }
    });
}

// Функции для оповещения.
function Notify(UpMessage, Color, Elimination = true, EliminationTime = 4000) {
    //В случае, если какой-то таймер ещё запущен. Нужно его остановить
    document.getElementById('ForNotice').setAttribute('style', `Color: ${Color} !important;cursor: auto; margin-bottom: 0rem;`);
    document.getElementById('ForNotice').innerHTML = UpMessage;

    if (Elimination) setTimeout(() => { BackToNormalNotify() }, EliminationTime);
}
function BackToNormalNotify() {
    // Заголовок
    document.querySelector('#ForNotice').setAttribute('style', `cursor: auto; margin-bottom: 0rem;`);
    document.querySelector('#ForNotice').innerHTML = "";
}
function BackToNormal() {
    try {
        R_btnFaceAPI.disabled = R_itPassword.value != R_itPassCheck.value
            || R_itLogin.value == ''
            || R_itPassword.value == ''
            || R_itPassCheck.value == '';
        CP_btnFaceAPI.disabled = CP_itPassword.value != CP_itPassCheck.value
            || CP_itLogin.value == ''
            || CP_itPassword.value == ''
            || CP_itPassCheck.value == '';
        A_btnFaceAPI.disabled = A_itLogin.value == '';
        var cameraPlace = document.getElementById(cameraPlaceID);
        cameraPlace.classList.remove('waitEnd');
        cameraPlace.classList.remove('showCamera');
        if (cameraPlace.Type == "Reg" || cameraPlace.Type == "CP")
            cameraPlace.innerHTML = `<p class="authorization navbar" id="${cameraPlaceID}" style="margin-bottom: 0;">Прикрепить портрет</p>`;
        else cameraPlace.innerHTML = `<p class="authorization navbar" id="${cameraPlaceID}" style="margin-bottom: 0;">Войти, используя лицо</p>`;
    } catch (e) { return; }
}
function Accounts(Controller = '/Index/Accounts', ReqData = "", Type = 'GET') {

    document.querySelectorAll("input").forEach(el => el.disabled = true);
    disableElements([btnReg, R_btnFaceAPI, CP_btnFaceAPI, btnAuth, A_btnFaceAPI, btnAccDel], true);

    if (document.getElementById('ForNotice').innerHTML != "Registration success") 
        Notify('Please, wait', '#ff8500', Elimination = false);    
    
    $.ajax({
        async: true,
        type: Type,
        url: Controller,
        data: ReqData,
        async: true,
        cache: false,
        processData: false,
        success: function (data) {
            if (data == 'Account is not exist' || data == 'Incorrect password') {
                console.log(data);
                Notify(data, '#DC143C');
                changeTextValue([AD_itLogin, AD_itPassword], "");
                changeCreatePortrait();
                changeRegister();
                changeAuth();
                changeAD();
                document.querySelectorAll("input").forEach(el => el.disabled = false);
            }
            else location.reload();
        },
        error: function () {
            console.log("Accounts error");
            document.querySelectorAll("input").forEach(el => el.disabled = false);
        }
    });
}