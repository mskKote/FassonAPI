
// HTTPS VS HTTP
window.addEventListener('DOMContentLoaded', function () {
    if (location.protocol == 'http:')
        location.protocol = 'https:';
});

/// ТЁМНАЯ ТЕМА /////////////////////
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


/// РЕГИСТРАЦИЯ /////////////////////
var R_itLogin = document.querySelector('input.Registration[name="Login"]');
var R_itPassword = document.querySelector('input.Registration[name="Password"]');
var R_itPassCheck = document.querySelector('input.Registration[name="PasswordCheck"]');
var btnReg = document.querySelector('#btnReg');
var R_btnFaceAPI = document.querySelector('#RegistrPortrait');

/// ПРИКРЕПЛЕНИЕ ПОРТРЕТА /////////////////////
var CP_itLogin = document.querySelector('input.CreatePortrait[name="Login"]');
var CP_itPassword = document.querySelector('input.CreatePortrait[name="Password"]');
var CP_itPassCheck = document.querySelector('input.CreatePortrait[name="PasswordCheck"]');
var CP_btnFaceAPI = document.querySelector('#CreatePortrait');

/// АУТЕНТИФИКАЦИЯ /////////////////////
var A_itLogin = document.querySelector('input.Auth[name="Login"]');
var A_itPassword = document.querySelector('input.Auth[name="Password"]');
var btnAuth = document.querySelector('#btnAuth');
var A_btnFaceAPI = document.querySelector('#AuthPortrait');

/// УДАЛЕНИЕ АККАУНТА /////////////////////
var AD_itLogin = document.querySelector('input.AccDel[name="Login"]');
var AD_itPassword = document.querySelector('input.AccDel[name="Password"]');
var btnAccDel = document.querySelector('#btnAccDel');

/////////////////////////////////////
disableElements([btnReg, R_btnFaceAPI, CP_btnFaceAPI, btnAuth, A_btnFaceAPI, btnAccDel], true);
subscribeInput([R_itLogin, R_itPassword, R_itPassCheck], changeRegister);
subscribeInput([CP_itLogin, CP_itPassword, CP_itPassCheck], changeCreatePortrait);
subscribeInput([A_itLogin, A_itPassword], changeAuth);
subscribeInput([AD_itLogin, AD_itPassword], changeAD);

// Функции для изменения текста.
function changeRegister() {
    R_itLogin.value = R_itLogin.value.replace('/', '');
    correctText([R_itLogin, R_itPassword, R_itPassCheck]);
    if (R_itLogin.value.length > 50) R_itLogin.value = R_itLogin.value.slice(0, -1);
    changeEnable([btnReg, R_btnFaceAPI], R_itPassword.value != R_itPassCheck.value
        || R_itLogin.value == ''
        || R_itPassword.value == ''
        || R_itPassCheck.value == '');
}
function changeCreatePortrait() {
    CP_itLogin.value = CP_itLogin.value.replace('/', '');
    correctText([CP_itLogin, CP_itPassword, CP_itPassCheck]);
    if (CP_itLogin.value.length > 50) CP_itLogin.value = CP_itLogin.value.slice(0, -1);
    changeEnable([CP_btnFaceAPI], CP_itPassword.value != CP_itPassCheck.value
        || CP_itLogin.value == ''
        || CP_itPassword.value == ''
        || CP_itPassCheck.value == '');
}
function changeAuth() {
    A_itLogin.value = A_itLogin.value.replace('/', '');
    correctText([A_itLogin, A_itPassword]);
    if (A_itLogin.value.length > 50) A_itLogin.value = A_itLogin.value.slice(0, -1);
    changeEnable([btnAuth, A_btnFaceAPI], A_itLogin.value == '');
}
function changeAD() {
    AD_itLogin.value = AD_itLogin.value.replace('/', '');
    correctText([AD_itLogin, AD_itPassword]);
    if (AD_itLogin.value.length > 50) AD_itLogin.value = AD_itLogin.value.slice(0, -1);
    changeEnable([btnAccDel], AD_itLogin.value == '' || AD_itPassword.value == '');
}

function changeEnable(ElementsArr, Condition) {
    if (Condition)
        deleteCameraAfterAction();
    disableElements(ElementsArr, Condition);
}
function disableElements(ElementsArr, Condition) {
    for (var i = 0; i < ElementsArr.length; i++)
        ElementsArr[i].disabled = Condition;
}
function correctText(ElementsArr) {
    for (var i = 0; i < ElementsArr.length; i++)
        ElementsArr[i].value = ElementsArr[i].value.replace(' ', '');;
}
function subscribeInput(ElementsArr, func) {
    for (var i = 0; i < ElementsArr.length; i++)
        ElementsArr[i].addEventListener('input', func);
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
        Type = 'LinkFacePortrait';
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
                data = data == 'True' ? "Correct Portrait" : data;
                BackToNormal();
            }
            else {
                if (data == 'True')
                    data = Type + " success";
            }
            console.log(data);
            document.getElementById('loading').classList.remove('is-active');
            Notify(data, color, Elimination = false);

            deleteCameraAfterAction();
            R_itLogin.value = "";
            R_itPassword.value = "";
            R_itPassCheck.value = "";
            CP_itLogin.value = "";
            CP_itPassword.value = "";
            CP_itPassCheck.value = "";
            A_itLogin.value = "";
            A_itPassword.value = "";
            changeRegister();
            changeAuth();

            if (color == '#FF1493') // data was true
            {// Перезагружаю аккаунты, если регистрация
                if (Controller == "/Index/RegFace/" ||
                    Controller == "/Index/Registration/" ||
                    Controller == "/Index/LinkFacePortrait/") Accounts();
            }
            setTimeout(() => { BackToNormalNotify(); }, 3500);
        },
        error: function (data, textStatus) {
            console.log(`${Type} ERROR`);
            console.log(reqData);
            Notify(`${textStatus} : ${data}`, '#DC143C', Elimination = false);
            document.getElementById('loading').classList.remove('is-active');
        }
    });
}

// Функции для оповещения.
function Notify(UpMessage, Color, Elimination = true, EliminationTime = 4000) {
    //В случае, если какой-то таймер ещё запущен. Нужно его остановить
    document.getElementById('ForNotice').setAttribute('style', `Color: ${Color} !important;cursor: auto; margin-bottom: 0rem;`);
    document.getElementById('ForNotice').innerHTML = UpMessage;

    if (Elimination)
        setTimeout(() => { BackToNormalNotify() }, EliminationTime);
}
function BackToNormalNotify() {
    // Заголовок
    document.querySelector('#ForNotice').setAttribute('style', `cursor: auto; margin-bottom: 0rem;`);
    document.querySelector('#ForNotice').innerHTML = "";
}
function BackToNormal() {
    try {
        var cameraPlace = document.getElementById(cameraPlaceID);
        cameraPlace.classList.remove('waitEnd');
        document.querySelector(`button#${cameraPlaceID}`).classList.remove('showCamera');
        if (cameraPlace.Type == "Reg" || cameraPlace.Type == "CP")
            cameraPlace.innerHTML = `<p id="${cameraPlaceID}" style="margin-bottom: 0;">Прикрепить портрет</p>`;
        else cameraPlace.innerHTML = `<p id="${cameraPlaceID}" style="margin-bottom: 0;">Войти, используя лицо</p>`;
    } catch (e) {
        return;
    }
}
function Accounts(Controller = '/Index/Accounts', ReqData = "", Type = 'GET') {
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
                AD_itLogin.value = "";
                AD_itPassword.value = "";
                changeAD();
            }
            else location.reload();
        },
        error: function () { console.log("Accounts error"); }
    });
}