//videocountは新たに選択したビデオがあるときその前に再生していたビデオを解放するためにある
var videocount = 0;
var videolist=[];
var v = document.getElementById("video");
const videoFileInput = document.getElementById("video-file-input");
const ChapterFileInput = document.getElementById("ChapterFile");

//API
var tag = document.createElement("script");

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let ABLoop2 = false;
var inputtedVideoId='';
var player;
function onYouTubeIframeAPIReady(){
    player = new YT.Player('player',{
        height:'360',
        width:'640',
        videoId:inputtedVideoId,
        events:{
            'onReady':onPlayerReady,
            'onStateChange':onPlayerStateChange
        }
    });
}
function onPlayerReady(event){
    event.target.playVideo();
}
function onPlayerStateChange(event){
    var status = event.data;
    var names = {'-1':'未開始',
    '0' : '終了',
    '1' : '再生中',
    '2' : '停止',
    '3' : 'バッファリング中',
    '5' : '頭出し済み'};

    console.log('names[status]:',names[status]);
    if (ABLoop2 && names[status]=='終了'){
        console.log("END");
        event.target.loadVideoById({
            videoId:String(inputtedVideoId),
            startSeconds:inputtedA2,
            endSeconds:inputtedB2
        });
        //event.target.playVideo();
    }
    //document.getElementById('dispENDED').innerHTML = 'ENDED:'+String(names[status]);
}

function seekToInputted(){
    var seekedtime=document.getElementById("seekedTime").value;
    seekedtime=changeTimeForm(seekedtime);
    console.log(seekedtime);
    player.seekTo(seekedtime);
}

function toggleABloop2(){
    ABLoop2 = !ABLoop2;
    console.log('ABLoop2:',ABLoop2);
    if (ABLoop2){ABLoop2_state="on";}
    else if(!ABLoop2){ABLoop2_state="off";}
    document.getElementById('dispABLoop2').innerHTML = "ABLoop:"+String(ABLoop2_state);
}

function submitAB2(){
    const A2e = document.getElementById('A2');
    const B2e = document.getElementById('B2');
    if (!ABLoop2){
        ABLoop2=true;
        document.getElementById('dispABLoop2').innerHTML = "ABLoop:on";
    }
    inputtedA2 = changeTimeForm(A2e.value);
    inputtedB2 = changeTimeForm(B2e.value);
    if (inputtedA2 < inputtedB2){
        var owari = player.getDuration()
        player.seekTo(owari);
        console.log('getDuration:',player.getDuration);
        console.log('A2:',inputtedA2,'\nB2:',inputtedB2);
    }
    else{
        console.log("error:A≧Bとなっています。")
    }
}

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
                timeCell.innerHTML = `<a href="#">${time}</a>`;

                newRow.appendChild(titleCell);
                newRow.appendChild(timeCell);
                tableBody.appendChild(newRow);
            }
        }
        
        console.log('CSVファイルの内容：');
        console.log(csvContent);
    };
    reader.readAsText(ChapterFile,'Shift_JIS');
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
    if (tableContainer.style.display === "none") {
        tableContainer.style.display = "block"; // テーブルを表示
    } else {
        tableContainer.style.display = "none"; // テーブルを非表示
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

function getCurrentTime(){
    currentTime=v.currentTime;
    document.getElementById("kanryou").innerHTML = "now="+currentTime;
}

function setCurrentTimeToA(){
    const Ae = document.getElementById("A");
    Ae.value=v.currentTime;
}

function setCurrentTimeToB(){
    const Be = document.getElementById("B");
    Be.value=v.currentTime;
}

function analyseumekomicode(umekomi){
    umekomi=umekomi.split('"');
    console.log('umekomi:',umekomi);
    umekomi2=umekomi[5];
    umekomi2=umekomi2.split('/');
    console.log('umekomi2:',umekomi2);
    var id = umekomi2.slice(-1)[0];
    return id;
}

function submitCode(){
    const InputtedCode = document.getElementById("InputtedCode");
    var fullcode = InputtedCode.value;
    //fullcode = fullcode.split('"');
    console.log("log:",fullcode);
    inputtedVideoId = analyseumekomicode(fullcode);
    console.log("inputtedVideoId:",inputtedVideoId);
    player.loadVideoById(inputtedVideoId);
}

function submitUrl(youtubeurl){
    const InputtedUrl = document.getElementById("InputtedUrl");
    var fullurl = InputtedUrl.value;
    console.log('fullurl:',fullurl);
    inputtedVideoId = analyseUrl(fullurl);
    player.loadVideoById(inputtedVideoId);
}

function analyseUrl(url){
    url2=url.split('/');
    console.log('url2',url2);
    url2=url2[3].split('=');
    console.log('url2',url2);
    id=url2[1]
    return id;
}
//https://www.youtube.com/watch?v=LnFGoyiX0f4