
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

   
    if (email === "admin@example.com" && password === "123456") {
        alert('Đăng nhập thành công!');
       
        window.location.href = 'home.html';
    } else {
        alert('Email hoặc mật khẩu không đúng!');
    }
});



function confirmLogout(event) {
    event.preventDefault(); 
    
    // Xác nhận đăng xuất
    const confirmation = confirm("Bạn có chắc chắn muốn đăng xuất?");
    if (confirmation) {
        logout();
    }
}

function logout() {
   
    localStorage.removeItem("token");  
    sessionStorage.removeItem("token"); 
    
    localStorage.clear();
    sessionStorage.clear();

    
    window.location.href = "../html/dangnhap.html"; 
}
