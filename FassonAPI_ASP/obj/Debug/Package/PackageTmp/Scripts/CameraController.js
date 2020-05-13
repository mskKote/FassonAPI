
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
        })
        .catch(function (err) {
            Notify(err == 'NotAllowedError: Permission denied' ?
                'Please, give permission for camera' :
                'You do not have webcam', '#DC143C');

            console.log("WEBRTC error : " + err);
            deleteCameraAfterAction();
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

        video.onloadedmetadata = function (e) { video.play(); };
    }, false);
}

// Снимаем и просим пользователя ждать завершения.
function takepicture() {
    Notify('Please, wait', '#ff8500', Elimination = false);

    document.getElementById('loading').classList.add('is-active');

    document.getElementById(cameraPlaceID).classList.add('waitEnd');
    document.getElementById('startbutton').classList.add('waitEnd');

    var context = canvas.getContext('2d');

    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);
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
        '<button id="startbutton" onclick="takepicture();" class="Instruction_manual_UI">Make portrait</button>' +
        '<canvas id="canvas"></canvas>';

    document.getElementById(PlaceID).classList.add('showCamera');
    document.getElementById(PlaceID).append(cameraInterface);
    startup();
}