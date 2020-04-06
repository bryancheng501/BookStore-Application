function createAccount(){
    username = document.getElementById('username').value
    password = document.getElementById('password').value

    if (!username || !password){
        alert("Please input a username and password!")
        return;
    }

    let req = new XMLHttpRequest()
    req.onreadystatechange = function(){
        if (this.readyState==4 && this.status == 200){
            alert(this.responseText);
        }
    }
    req.open('POST', '/createAccount')
    req.setRequestHeader('Content-type', 'application/json')
    req.send(JSON.stringify({'username' : username, 'password' : password}))

}


function logIn(){
    username = document.getElementById('username').value
    password = document.getElementById('password').value

    if (!username || !password){
        alert("Please input a username and password!")
        return;
    }

    let req = new XMLHttpRequest()
    req.onreadystatechange = function(){
        if (this.readyState==4 && this.status == 200){
            response = JSON.parse(this.responseText)
            if (response.loggedIn){
                alert('Succesfully logged in!')
                //redirect them based on account type
            }   else{
                alert('Invalid username and/or password!')
            }
        }
    }
    req.open('POST', '/logIn')
    req.setRequestHeader('Content-type', 'application/json')
    req.send(JSON.stringify({'username' : username, 'password' : password}))
}