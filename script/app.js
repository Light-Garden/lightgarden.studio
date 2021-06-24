const sections = document.querySelectorAll('section');
const parabg = document.querySelectorAll('.parabg');

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function throttle(fn, wait) {
  var time = Date.now();
  return function() {
    if ((time + wait - Date.now()) < 0) {
      fn();
      time = Date.now();
    }
  }
}

window.addEventListener('scroll', throttle(() => {
    const mutations = []; 
    var scrolling = false;
    const runMutations = () => mutations.forEach((m) => m());

    if (!scrolling && window.pageYOffset > 50) {
      mutations.push(() => document.querySelector('nav').classList.add('scrolling'));
      scrolling = true;
    } else {
      mutations.push(() => document.querySelector('nav').classList.remove('scrolling'));
      scrolling = false;
    }

    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].getBoundingClientRect().top <= (sections[i].offsetHeight/2)) {
        if (currentSection != sections[i].id) {
          const lastSection = currentSection, s = sections[i];
          
          mutations.push(() => {
            document.body.classList.remove(`current-${lastSection}`);
            document.body.classList.add(`current-${s.id}`);
          });

          currentSection = s.id;
        } 

        break;
      }
    }

    requestAnimationFrame(runMutations);
}, 100));

window.addEventListener('scroll', () => {
  parabg.forEach((p) => {
    p.style.backgroundPositionY = `-${window.pageYOffset * p.dataset.speed}px`;
  });
});

var currentSection = "home";
document.body.classList.add(`current-${currentSection}`);

var nav = document.querySelector('nav');

document.querySelector('.hamburger-menu').addEventListener('click', (e) => {
  nav.classList.toggle('open');
});

document.querySelector('.menu').addEventListener('click', (e) => {
  nav.classList.remove('open');
})

document.querySelector('.header a').addEventListener('click', (e) => {
  nav.classList.remove('open');
})

// vh fix for mobile browsers
function setVh() {
  // We execute the same script as before
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVh();
// window.addEventListener('resize', setVh);