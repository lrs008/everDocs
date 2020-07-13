function displayDate(){
    // document.getElementById("demo").innerHTML = Date();
    document.getElementById("demobtn1").style.display = "none";
    setTimer()
}




var i = 0;
var txt = 'Welcome to Bcore  team !';
var speed = 80;
function typeWriter() {
    if (i < txt.length) {
        document.getElementById("demo1").innerHTML += txt.charAt(i);
        i++;
        setTimeout(typeWriter, speed);
    }


    
}


// 聊天js begin
function openForm() {
    document.getElementById("myForm").style.display = "block";
  }
  
  function closeForm() {
    document.getElementById("myForm").style.display = "none";
  }
// 聊天js end


function setTimer(){
    var clockElement = document.getElementById( "clock" );
    console.log("######## setTimer clockElement  = ")
    console.log(clockElement)
    clockElement.innerHTML = new Date().toLocaleTimeString();

    function updateClock (  ) {
        var clockElement = document.getElementById( "clock" );
        clockElement.innerHTML = new Date().toLocaleTimeString();
    }
    setInterval(updateClock, 1000);
}

