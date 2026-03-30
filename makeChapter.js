let toggletimetitle=false;

console.log('あるよ');

function makeChapter(precsv){
    csv=""
    for (let i=0;i<precsv.length;i++){
        title=1;
        time=0;
        if (toggletimetitle){
            title=0;
            time=1;
        }
        csv+=String(precsv[i][title]+","+precsv[i][time]+'\n');
    }
    console.log("csv",csv);
    outputcsv(csv);
}
function submitRowtext(){
    rtext=document.getElementById("row_text").value;
    precsv=rtext.split('\n');
    console.log(precsv);
    for (let i=0;i<precsv.length;i++){
        precsv[i]=precsv[i].split(' ');
    }
    console.log("precsv:",precsv);
    makeChapter(precsv);
}

function outputcsv(csv){
    var blob =new Blob([csv],{type:"text/csv"}); //配列に上記の文字列(str)を設定
    var link =document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download ="Chapter.csv";
    link.click();
}

function toggleTimeTitle(){
    toggletimetitle=!toggletimetitle;
}