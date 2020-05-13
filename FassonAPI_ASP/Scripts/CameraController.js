
var video, canvas, startbutton, imageStream, cameraPlaceID,
    controller, width = 600, height = 0, streaming = false;

function startup() {
    video = document.getElementById('video');
    canvas = document.getElementById('canvas');
    startbutton = document.getElementById('startbutton');

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(function (stream) {
            imageStream = stream;
            video.srcObject = imageStream;
            video.onloadedmetadata = function (e) { video.play(); };
            btnReg.onclick = function () { Submit('/Index/Registration/'); }
            btnAuth.onclick = function () { Submit('/Index/Authentication/'); }
            btnReg.disabled = R_itPassword.value != R_itPassCheck.value
                           || R_itLogin.value == ''
                           || R_itPassword.value == ''
                           || R_itPassCheck.value == '';
            btnAuth.disabled = A_itLogin.value == '';
            startbutton.disabled = false;
            document.querySelectorAll("input").forEach(el => el.disabled = false);
        })
        .catch(function (err) {
            Notify(err == 'NotAllowedError: Permission denied' ?
                'Please, give permission for camera' :
                'You do not have webcam', '#DC143C');

            console.log("WEBRTC error : " + err);
            deleteCameraAfterAction();
            btnReg.disabled = R_itPassword.value != R_itPassCheck.value
                || R_itLogin.value == ''
                || R_itPassword.value == ''
                || R_itPassCheck.value == '';
            btnAuth.disabled = A_itLogin.value == '';
        });

    video.addEventListener('canplay', function (ev) {

        if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);

            // Для Firefox 
            if (isNaN(height)) height = width / (4 / 3);

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    }, false);
}

// Снимаем и просим пользователя ждать завершения.
function takepicture() {
    document.querySelectorAll("input").forEach(el => el.disabled = true);
    disableElements([btnReg, R_btnFaceAPI, CP_btnFaceAPI, btnAuth, A_btnFaceAPI, btnAccDel], true);
    Notify('Please, wait', '#ff8500', Elimination = false);

    document.getElementById('loading').classList.add('is-active');

    document.getElementById(cameraPlaceID).classList.add('waitEnd');
    document.getElementById('startbutton').classList.add('waitEnd');


    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    }
    Submit(controller);
}

// Останавливаем камеры, если они существуют.
function deleteCameraAfterAction() {
    try {
        BackToNormal();
        imageStream.getTracks().forEach((track) => { track.stop(); });
        document.querySelector('.camera').remove();
        console.log(`Camera was deleted at ${cameraPlaceID}`);
    } catch (e) { return; }
}

// Функция, чтобы при нажатии кнопки создавать фрейм со всем необходимым.
function AddCameraAction(PlaceID, Controller) {
    document.getElementById('btnReg').onclick = '';
    document.getElementById('btnAuth').onclick = '';
    disableElements([btnReg, btnAuth], true);
    document.querySelectorAll("input").forEach(el => el.disabled = true);
    // Удалим предыдущий, если такой в принципе есть.    
    deleteCameraAfterAction();
    document.querySelector(`p#${PlaceID}`).remove();

    //Создадим, что нужно
    controller = Controller;
    cameraPlaceID = PlaceID;
    document.querySelector(`#${cameraPlaceID}`).disabled = true;

    var cameraInterface = document.createElement('p');
    cameraInterface.setAttribute('class', 'camera');
    cameraInterface.innerHTML =
        '<video id="video">Video stream not available.</video> ' +
        '<button id="startbutton" onclick="takepicture();" class="Instruction_manual_UI" disabled>Make portrait</button>' +
        '<canvas id="canvas"></canvas>';

    document.getElementById(PlaceID).classList.add('showCamera');
    document.getElementById(PlaceID).append(cameraInterface);
    startup();
}