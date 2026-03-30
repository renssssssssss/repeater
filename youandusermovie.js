//API
var tag = document.createElement("script");
const YChapterFileInput = document.getElementById("youtubeChapterFile");
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var inputtedA2;
var inputtedB2;
var timefortimer2=-1;
let pausewhilelooping = false;//（未実装）動画が変わったらこの辺の変数は初期化する
let ABLoop2 = false;
var ABtimer;
var ABtimer2;//停止やバッファリング中などの際にこちらを一度だけ使い、その後ABtimerを使用するlooptimer()を実行
var inputtedVideoId='';
var player;
var numTimer=0;
var numTimer2=0;
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
//ループ中に再生時間を移動した際の処理(seekToの場合は停止状態を経由しないためこちらに来る)
//ループ外の場合強制的にループの初めに戻る
    console.log('names[status]:',names[status]);
    if (names[status]=='バッファリング中' && numTimer==1){
        clearTimeout(ABtimer);
        numTimer-=1;
        console.log('buf:タイマー1破棄');
        timefortimer2=player.getCurrentTime();
        if(ABLoop2){
            console.log('buf:待機時間:',inputtedB2-timefortimer2);
            ABtimer2=setTimeout('looptimer()',(inputtedB2-timefortimer2)*1000);
            numTimer2+=1;
            console.log();
            console.log('buf:タイマー2作成buf');
        }
    }
    else if (names[status]=='バッファリング中'&&numTimer2==1){
        clearTimeout(ABtimer2);
        numTimer2-=1;
        timefortimer2=-1;
        console.log('buf:タイマー2破棄');
        timefortimer2=player.getCurrentTime();
        if(ABLoop2){
            console.log('buf:待機時間:',inputtedB2-timefortimer2);
            ABtimer2=setTimeout('looptimer()',(inputtedB2-timefortimer2)*1000);
            numTimer2+=1;
            console.log();
            console.log('buf:タイマー2作成');
        }
    }
    else if(names[status]=="バッファリング中"&&pausewhilelooping){//停止を解除するとここに来る
        pausewhilelooping=false;
        timefortimer2=player.getCurrentTime();
        ABtimer2=setTimeout('looptimer()',(inputtedB2-timefortimer2)*1000)
        console.log("buf:タイマー2作成");
    }
//ループ中に再生時間を移動した際の処理（以上）

//ループ中に停止した場合の処理(単純に停止またはシークバーから再生時間を操作し始めたタイミングでここに来る)
    if (names[status]=='停止'&&ABLoop2){
        //console.log('pause:');
        if (numTimer==1){
            clearTimeout(ABtimer);
            numTimer-=1;
            console.log("pause:タイマー１破棄");
        }
        else if (numTimer2==1){
            clearTimeout(ABtimer2);
            numTimer2-=1;
            console.log('pause:タイマー２破棄');
        }
        pausewhilelooping=true;
    }
//ループ中に停止した際の処理（ここまで）


}

function seekToInputted(){
    var seekedtime=document.getElementById("seekedTime").value;
    seekedtime=changeTimeForm(seekedtime);
    //console.log(seekedtime);
    player.seekTo(seekedtime);
}

function toggleABloop2(){
    ABLoop2 = !ABLoop2;
    console.log('ABLoop2:',ABLoop2);
    if (ABLoop2){ABLoop2_state="on";}
    else if(!ABLoop2){
        ABLoop2_state="off";
        if(numTimer==1){
            clearTimeout(ABtimer);
            numTimer-=1;
        }
        if(numTimer2==1){
            clearTimeout(ABtimer2);
            numTimer2-=1;
            timefortimer2=-1;
        }
        console.log('タイマー破棄');
    }
        
    document.getElementById('dispABLoop2').innerHTML = "ABLoop:"+String(ABLoop2_state);
}

function submitAB2(){
    const A2e = document.getElementById('A2');
    const B2e = document.getElementById('B2');
    inputtedA2 = changeTimeForm(A2e.value);
    inputtedB2 = changeTimeForm(B2e.value);
    if (!ABLoop2){
        console.log('ABLoop2がoffです');
        //ABLoop2=true;
        //document.getElementById('dispABLoop2').innerHTML = "ABLoop:on";
    }
    else if (inputtedA2 < inputtedB2){
        //var owari = player.getDuration();
        //player.seekTo(owari);
        looptimer();
        //console.log('getDuration:',player.getDuration);
        //console.log('A2:',inputtedA2,'\nB2:',inputtedB2);
    }
    else{
        console.log("error:A≧Bとなっています。");
    }
}

function looptimer(){
    if(numTimer==1){
        clearTimeout(ABtimer);
        console.log('looptimer:タイマー1破棄');
        numTimer-=1;
    }
    else if (numTimer2==1){
        clearTimeout(ABtimer2);
        console.log('looptimer:タイマー2破棄');
        numTimer2-=1;
        timefortimer2=-1;
    }
    if (ABLoop2){
        taiki=inputtedB2-inputtedA2;
        player.seekTo(inputtedA2);
        ABtimer=setTimeout("looptimer()",taiki*1000);
        numTimer+=1;
        console.log('looptimer:タイマー1作成');
    }
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

//埋め込みコード全部行ける
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
    console.log("log:",fullcode);
    inputtedVideoId = analyseumekomicode(fullcode);
    console.log("inputtedVideoId:",inputtedVideoId);
    player.loadVideoById(inputtedVideoId);
}

//検索バーに出るURl（〃いける）
//PC検索バーのリンク例
//https://www.youtube.com/watch?v=ZJ-Je8uvmjw&t=29s
//https://www.youtube.com/shorts/EHlEnKBJ4L4

function submitUrl(){
    const InputtedUrl = document.getElementById("InputtedUrl");
    var fullurl = InputtedUrl.value;
    console.log('fullurl:',fullurl);
    inputtedVideoId = analyseUrl(fullurl);
    player.loadVideoById(inputtedVideoId);
}

function analyseUrl(url){
    url2=url.split('/');
    if (url2[3]=="shorts"){
        id=url2[4];
    }else{
        console.log('url2',url2);
        url2=url2[3].split('=');
        console.log('url2',url2);
        id=url2[1]
    }
    return id;
}

//スマホの共有からとれるURL（short,live行ける）
function submitShareUrl(){
    const InputtedShareUrl = document.getElementById("InputtedShareUrl");
    var fullshareurl = InputtedShareUrl.value;
    inputtedVideoId = analyseShareUrl(fullshareurl);
    console.log(inputtedVideoId);
    player.loadVideoById(inputtedVideoId);
}

function analyseShareUrl(shareurl){
    shareurl=shareurl.split('/');
    shareurl=shareurl.slice(-1)[0].split('?si=');
    id=shareurl[0];
    return id;
}

function toggleTable() {
    const tableContainer = document.getElementById("tableContainer2");
    if (tableContainer.style.display === "block") {///===は自動的に型を変換せず厳密に比較する
        tableContainer.style.display = "none"; // テーブルを表示
    } else {
        tableContainer.style.display = "block"; // テーブルを非表示
    }
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
        player.seekTo(clickedTime);
}

YChapterFileInput.addEventListener("change",function(){
    const ChapterFile = YChapterFileInput.files[0];
    console.log();
    if (!ChapterFile){
        console.log('ファイルが選択されていません');
        return;
    }
    const reader = new FileReader();
    reader.onload = function(event){
        const csvContent = event.target.result;

        const lines = csvContent.split('\n');
        const tableBody = document.querySelector('#dataTable2 tbody');
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
document.getElementById('dataTable2').addEventListener('click', function(event) {
    if (event.target.tagName === 'A') {
    const clickedTime = event.target.textContent;
    console.log('クリックされた時間:', clickedTime);
    // ここに時間をどう処理するかのコードを追加することができます
    clickChapter();
    }
});



function clickPlay(){
    player.playVideo();
}

function clickPause(){
    player.pauseVideo();
}

function clickStop(){
    player.stopVideo();
}

//Aの時間操作

function clickMAH(){
    A2formval=document.getElementById("A2").value;
    A2formval=changeTimeForm(A2formval);
    if (A2formval==0 || isNaN(A2formval)){
        A2formval=0;
        console.log(A2formval);
    }
    A2formval-=changeTimeForm("1:00:00");
    if (A2formval<0){
        A2formval=0;
    }
    A2formval=reverseTimeForm(A2formval);
    document.getElementById("A2").value=A2formval;

}
function clickMAM(){
    A2formval=document.getElementById("A2").value;
    A2formval=changeTimeForm(A2formval);
    if (A2formval==0 || isNaN(A2formval)){
        A2formval=0;
    }
    A2formval-=changeTimeForm("10:00");
    if (A2formval<0){
        A2formval=0;
    }
    A2formval=reverseTimeForm(A2formval);
    document.getElementById("A2").value=A2formval;

}
function clickMAS(){
    A2formval=document.getElementById("A2").value;
    A2formval=changeTimeForm(A2formval);
    if (A2formval==0 || isNaN(A2formval)){
        A2formval=0;
    }
    A2formval-=changeTimeForm("10");
    if (A2formval<0){
        A2formval=0;
    }
    A2formval=reverseTimeForm(A2formval);
    document.getElementById("A2").value=A2formval;

}
function clickPAS(){
    A2formval=document.getElementById("A2").value;
    A2formval=changeTimeForm(A2formval);
    if (A2formval==0 || isNaN(A2formval)){
        A2formval=0;
    }
    A2formval+=10;
    A2formval=reverseTimeForm(A2formval);
    document.getElementById("A2").value=A2formval;
}
function clickPAM(){
    A2formval=document.getElementById("A2").value;
    A2formval=changeTimeForm(A2formval);
    if (A2formval==0 || isNaN(A2formval)){
        A2formval=0;
    }
    A2formval+=changeTimeForm("10:00");
    A2formval=reverseTimeForm(A2formval);
    document.getElementById("A2").value=A2formval;
}
function clickPAH(){
    A2formval=document.getElementById("A2").value;
    A2formval=changeTimeForm(A2formval);
    if (A2formval==0 || isNaN(A2formval)){
        A2formval=0;
    }
    A2formval+=changeTimeForm("1:00:00");
    A2formval=reverseTimeForm(A2formval);
    document.getElementById("A2").value=A2formval;
}
//Aの時間操作ここまで

//Bの時間操作

function clickMBH(){
    B2formval=document.getElementById("B2").value;
    B2formval=changeTimeForm(B2formval);
    if (B2formval==0 || isNaN(B2formval)){
        B2formval=0;
        console.log(B2formval);
    }
    B2formval-=changeTimeForm("1:00:00");
    if (B2formval<0){
        B2formval=0;
    }
    B2formval=reverseTimeForm(B2formval);
    document.getElementById("B2").value=B2formval;

}
function clickMBM(){
    B2formval=document.getElementById("B2").value;
    B2formval=changeTimeForm(B2formval);
    if (B2formval==0 || isNaN(B2formval)){
        B2formval=0;
    }
    B2formval-=changeTimeForm("10:00");
    if (B2formval<0){
        B2formval=0;
    }
    B2formval=reverseTimeForm(B2formval);
    document.getElementById("B2").value=B2formval;
}
function clickMBS(){
    B2formval=document.getElementById("B2").value;
    B2formval=changeTimeForm(B2formval);
    if (B2formval==0 || isNaN(B2formval)){
        B2formval=0;
    }
    B2formval-=changeTimeForm("10");
    if (B2formval<0){
        B2formval=0;
    }
    B2formval=reverseTimeForm(B2formval);
    document.getElementById("B2").value=B2formval;

}
function clickPBS(){
    B2formval=document.getElementById("B2").value;
    B2formval=changeTimeForm(B2formval);
    if (B2formval==0 || isNaN(B2formval)){
        B2formval=0;
    }
    B2formval+=10;
    B2formval=reverseTimeForm(B2formval);
    document.getElementById("B2").value=B2formval;
}
function clickPBM(){
    B2formval=document.getElementById("B2").value;
    B2formval=changeTimeForm(B2formval);
    if (B2formval==0 || isNaN(B2formval)){
        B2formval=0;
    }
    B2formval+=changeTimeForm("10:00");
    B2formval=reverseTimeForm(B2formval);
    document.getElementById("B2").value=B2formval;
}
function clickPBH(){
    B2formval=document.getElementById("B2").value;
    B2formval=changeTimeForm(B2formval);
    if (B2formval==0 || isNaN(B2formval)){
        B2formval=0;
    }
    B2formval+=changeTimeForm("1:00:00");
    B2formval=reverseTimeForm(B2formval);
    document.getElementById("B2").value=B2formval;
}



//Bの時間操作ここまで

//https://youtu.be/9Hx7044o0sk







//user
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
