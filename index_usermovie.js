//videocountは新たに選択したビデオがあるときその前に再生していたビデオを解放するためにある
var videocount = 0;
var videolist=[];
var v = document.getElementById("video");
const videoFileInput = document.getElementById("video-file-input");
const ChapterFileInput = document.getElementById("ChapterFile");

videoFileInput.addEventListener("change", function() {
    const selectedFile = videoFileInput.files[0];
    if (selectedFile) {
        // 選択されたファイルを動画のソースにセット
        v.src = URL.createObjectURL(selectedFile);
        videolist.push(selectedFile);
        videocount+=1;
        console.log("videolist:",videolist," videocount:",videocount);
        v.load();
        if (videocount>1){
            URL.revokeObjectURL(videolist[0]);
            videocount-=1;
            videolist.shift();
            console.log("videolist:",videolist," videocount:",videocount);
        }
        // 動画の読み込みが完了したら再生時間を表示
        v.addEventListener("loadedmetadata", function() {
            // 動画の再生時間（秒）を表示
            document.getElementById("nagasa").innerHTML = v.duration;
        });
    }
});

ChapterFileInput.addEventListener("change",function(){
    const ChapterFile = ChapterFileInput.files[0];
    console.log();
    if (!ChapterFile){
        console.log('ファイルが選択されていません');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event){
        const csvContent = event.target.result;

        const lines = csvContent.split('\n');
        const tableBody = document.querySelector('#dataTable tbody');
        tableBody.innerHTML = ''; // テーブルの内容をクリア

        for (const line of lines){
            const columns = line.split(',');
            if (columns.length >= 2){
                const title = columns[0];
                const time = columns[1];

                const newRow = document.createElement('tr');
                const titleCell = document.createElement('td');
                const timeCell = document.createElement('td');

                titleCell.textContent = title;
                timeCell.innerHTML = `<a href="javascript:void(0)">${time}</a>`;

                newRow.appendChild(titleCell);
                newRow.appendChild(timeCell);
                tableBody.appendChild(newRow);
            }
        }
        
        console.log('CSVファイルの内容：');
        console.log(csvContent);
    };
    reader.readAsText(ChapterFile,'UTF8');
});


// クリック時のイベントハンドラ
document.getElementById('dataTable').addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
    const clickedTime = event.target.textContent;
    console.log('クリックされた時間:', clickedTime);
    // ここに時間をどう処理するかのコードを追加することができます
    clickChapter();
    }
});


const Ae = document.getElementById("A");
let A = Ae.value;
let B = v.duration;
console.log(A,B);
let ABloop = false;


function getDuration() {
    //動画の長さ（秒）を表示
    document.getElementById("nagasa").innerHTML = videoFileInput.duration;
}

function checkLoop() {
    if (ABloop && v.currentTime >= B) {
        v.currentTime = A;
        console.log('loop!');
    }
}

function playVideo() {
    //再生完了の表示をクリア
    document.getElementById("kanryou").innerHTML = "";
    //動画を再生
    v.play();
    //現在の再生位置（秒）を表示
    v.addEventListener("timeupdate", function(){
        document.getElementById("ichi").innerHTML = v.currentTime;
        checkLoop();
        console.log('ABloop',ABloop,'B',B);
        }, false);

    //再生完了を知らせる
    v.addEventListener("ended", function(){
        document.getElementById("kanryou").innerHTML = "動画の再生が完了しました。";
    }, false);
}



function toggleTable() {
    const tableContainer = document.getElementById("tableContainer");
    if (tableContainer.style.display === "block") {///===は自動的に型を変換せず厳密に比較する
        tableContainer.style.display = "none"; // テーブルを表示
    } else {
        tableContainer.style.display = "block"; // テーブルを非表示
    }
}

function pauseVideo() {
    //動画を一時停止
    v.pause();
}

function upVolume() {
    //音量を上げる
    v.volume = v.volume + 0.25;
}

function downVolume() {
    //音量を下げる
    v.volume = v.volume - 0.25;
}

function toggleLoop(){
    v.loop = !v.loop;
}

function submitAB(){
    const Ae = document.getElementById("A");
    const Be = document.getElementById("B");
    A = Ae.value;
    B = Be.value;
    A=changeTimeForm(A);
    B=changeTimeForm(B);
    console.log("A:",A," B:",B);
    v.currentTime=A;
    ABloop=true
}

function toggleABloop(){
    ABloop=!ABloop;
}

function clickChapter(){
    const clickedTimeStr = event.target.textContent;
        timeArray = clickedTimeStr.split(':'); // 文字列を数値に変換Arrayに格納
        timeArray = timeArray.reverse();
        console.log(timeArray);
        clickedTime = 0;
        for (let i = 0; i< timeArray.length;i++){
            console.log("経過",parseFloat(timeArray[i])*60**(i));
            clickedTime+=parseFloat(timeArray[i])*60**(i);
        }
        // clickedTime を使って何らかの処理を行う
        console.log('クリックされた時間（数値）:', clickedTime);
        // 例：ビデオを指定の時間にシークする
        v.currentTime = clickedTime;
}

function changeTimeForm(strlist){//"oo:oo:oo"(文字列)=>ooo(秒)
    strlist = strlist.split(':');
    strlist = strlist.reverse();
    TimebySec=0;
    for (let i = 0; i < strlist.length;i++){
        TimebySec += parseFloat(strlist[i])*60**i;
    }
    return TimebySec
}

function reverseTimeForm(str){
    TimebySec=parseFloat(str);
    hour=Math.floor(TimebySec/3600);
    TimebySec-=hour*3600;
    minute=Math.floor(TimebySec/60);
    TimebySec-=minute*60;
    revTime=String(hour)+":"+String(minute)+":"+String(TimebySec);
    return revTime
}

function getCurrentTime(){
    currentTime=v.currentTime;
    document.getElementById("kanryou").innerHTML = "now="+currentTime;
}

function setCurrentTimeToA(){
    const Ae = document.getElementById("A");
    Ae.value=reverseTimeForm(v.currentTime);
}

function setCurrentTimeToB(){
    const Be = document.getElementById("B");
    Be.value=reverseTimeForm(v.currentTime);
}




//Aの時間操作

function mclickMAH(){
    Aformval=document.getElementById("A").value;
    Aformval=changeTimeForm(Aformval);
    if (Aformval==0 || isNaN(Aformval)){
        Aformval=0;
        console.log(Aformval);
    }
    Aformval-=changeTimeForm("1:00:00");
    if (Aformval<0){
        Aformval=0;
    }
    Aformval=reverseTimeForm(Aformval);
    document.getElementById("A").value=Aformval;

}
function mclickMAM(){
    Aformval=document.getElementById("A").value;
    Aformval=changeTimeForm(Aformval);
    if (Aformval==0 || isNaN(Aformval)){
        Aformval=0;
    }
    Aformval-=changeTimeForm("10:00");
    if (Aformval<0){
        Aformval=0;
    }
    Aformval=reverseTimeForm(Aformval);
    document.getElementById("A").value=Aformval;

}
function mclickMAS(){
    Aformval=document.getElementById("A").value;
    Aformval=changeTimeForm(Aformval);
    if (Aformval==0 || isNaN(Aformval)){
        Aformval=0;
    }
    Aformval-=changeTimeForm("10");
    if (Aformval<0){
        Aformval=0;
    }
    Aformval=reverseTimeForm(Aformval);
    document.getElementById("A").value=Aformval;

}
function mclickPAS(){
    Aformval=document.getElementById("A").value;
    Aformval=changeTimeForm(Aformval);
    if (Aformval==0 || isNaN(Aformval)){
        Aformval=0;
    }
    Aformval+=10;
    Aformval=reverseTimeForm(Aformval);
    document.getElementById("A").value=Aformval;
}
function mclickPAM(){
    Aformval=document.getElementById("A").value;
    Aformval=changeTimeForm(Aformval);
    if (Aformval==0 || isNaN(Aformval)){
        Aformval=0;
    }
    Aformval+=changeTimeForm("10:00");
    Aformval=reverseTimeForm(Aformval);
    document.getElementById("A").value=Aformval;
}
function mclickPAH(){
    Aformval=document.getElementById("A").value;
    Aformval=changeTimeForm(Aformval);
    if (Aformval==0 || isNaN(Aformval)){
        Aformval=0;
    }
    Aformval+=changeTimeForm("1:00:00");
    Aformval=reverseTimeForm(Aformval);
    document.getElementById("A").value=Aformval;
}
//Aの時間操作ここまで

//Bの時間操作

function mclickMBH(){
    Bformval=document.getElementById("B").value;
    Bformval=changeTimeForm(Bformval);
    if (Bformval==0 || isNaN(Bformval)){
        Bformval=0;
        console.log(Bformval);
    }
    Bformval-=changeTimeForm("1:00:00");
    if (Bformval<0){
        Bformval=0;
    }
    Bformval=reverseTimeForm(Bformval);
    document.getElementById("B").value=Bformval;

}
function mclickMBM(){
    Bformval=document.getElementById("B").value;
    Bformval=changeTimeForm(Bformval);
    if (Bformval==0 || isNaN(Bformval)){
        Bformval=0;
    }
    Bformval-=changeTimeForm("10:00");
    if (Bformval<0){
        Bformval=0;
    }
    Bformval=reverseTimeForm(Bformval);
    document.getElementById("B").value=Bformval;
}
function mclickMBS(){
    Bformval=document.getElementById("B").value;
    Bformval=changeTimeForm(Bformval);
    if (Bformval==0 || isNaN(Bformval)){
        Bformval=0;
    }
    Bformval-=changeTimeForm("10");
    if (Bformval<0){
        Bformval=0;
    }
    Bformval=reverseTimeForm(Bformval);
    document.getElementById("B").value=Bformval;

}
function mclickPBS(){
    Bformval=document.getElementById("B").value;
    Bformval=changeTimeForm(Bformval);
    if (Bformval==0 || isNaN(Bformval)){
        Bformval=0;
    }
    Bformval+=10;
    Bformval=reverseTimeForm(Bformval);
    document.getElementById("B").value=Bformval;
}
function mclickPBM(){
    Bformval=document.getElementById("B").value;
    Bformval=changeTimeForm(Bformval);
    if (Bformval==0 || isNaN(Bformval)){
        Bformval=0;
    }
    Bformval+=changeTimeForm("10:00");
    Bformval=reverseTimeForm(Bformval);
    document.getElementById("B").value=Bformval;
}
function mclickPBH(){
    Bformval=document.getElementById("B").value;
    Bformval=changeTimeForm(Bformval);
    if (Bformval==0 || isNaN(Bformval)){
        Bformval=0;
    }
    Bformval+=changeTimeForm("1:00:00");
    Bformval=reverseTimeForm(Bformval);
    document.getElementById("B").value=Bformval;
}
