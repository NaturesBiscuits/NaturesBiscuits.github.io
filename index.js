//sticky navigator scrolling down 
window.addEventListener("scroll", function(){
    var header = document.querySelector("header");
    header.classList.toggle("sticky", window.scrollY > 0);
})

//animation of hamburger(menu .container)
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar.style.display === 'flex') {
        sidebar.style.animationName = 'slide-up'; // Set closing animation
        setTimeout(() => {
            sidebar.style.display = 'none'; // Hide sidebar after animation completes
        }, 600); // Adjust the timeout to match the animation duration
    } else {
        sidebar.style.display = 'flex';
        sidebar.style.animationName = 'slide-down'; // Set opening animation
    }
}

function myFunction(x) {
    x.classList.toggle("change");
}

function infobutton() {
    const cardone = document.querySelector('.cardone');
    const computedStyleOne = window.getComputedStyle(cardone);
    const cardtwo = document.querySelector('.cardtwo');
    const computedStyleTwo = window.getComputedStyle(cardtwo);

    console.log("Current display style for cardone:", computedStyleOne.display);
    console.log("Current display style for cardtwo:", computedStyleTwo.display);

    // Check if both cards are hidden, then show them
    if (computedStyleOne.display === 'none' && computedStyleTwo.display === 'none') {
        console.log("Opening animation");
        cardone.style.display = 'flex';
        cardtwo.style.display = 'flex';
        cardone.style.animationName = 'cardoneslide';
        cardtwo.style.animationName = 'cardtwoslide';
    } else {
        console.log("Closing animation");
        cardone.style.animationName = 'cardoneslideout';
        cardtwo.style.animationName = 'cardtwoslideout';
        setTimeout(() => {
            cardone.style.display = 'none';
            cardtwo.style.display = 'none';
        }, 600);
    }
}

// to open project 1

function openInNewTab(url) {
    window.open(url, '_blank');
}

