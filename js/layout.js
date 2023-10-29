const sidebarBtn = document.querySelector("#sidebarBtn");

sidebarBtn.addEventListener("click", toggleSidebar());

function toggleSidebar() {
    document.querySelector("#sidebar").classList.toggle("active");
}