const sections = document.querySelectorAll('section');
const parabg = document.querySelectorAll('.parabg');
const nav = document.querySelector('nav');
const sectionMap = [];

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

function buildSectionMap() {
  sectionMap.splice(0, sectionMap.length);
  sections.forEach((s) => {
    const b = s.getBoundingClientRect().top + window.pageYOffset - (s.offsetHeight/2);
    sectionMap.push({ bound: b, section: s });
  });
}

window.addEventListener('scroll', throttle(() => {
    const mutations = [], scroll = window.pageYOffset; 
    var scrolling = false;
    const runMutations = () => mutations.forEach((m) => m());

    if (!scrolling && scroll > 50) {
      mutations.push(() => nav.classList.add('scrolling'));
      scrolling = true;
    } else {
      mutations.push(() => nav.classList.remove('scrolling'));
      scrolling = false;
    }

    for (var i = sectionMap.length - 1; i >= 0; i--) {
      if (scroll > sectionMap[i].bound) {
        const s = sectionMap[i].section;

        if (currentSection != s.id) {
          const lastSection = currentSection;
          
          mutations.push(() => {
            document.body.classList.remove(`current-${lastSection}`);
            document.body.classList.add(`current-${s.id}`);
            s.classList.add('section-in');
          });

          currentSection = s.id;
        } 

        break;
      }
    }

    requestAnimationFrame(runMutations);
}, 10));

window.addEventListener('scroll', () => {
  parabg.forEach((p) => {
    p.style.transform = `translateY(-${window.pageYOffset * p.dataset.speed}px)`;
  });
});

var currentSection = "home";
document.body.classList.add(`current-${currentSection}`);

document.querySelector('.hamburger-menu') && document.querySelector('.hamburger-menu').addEventListener('click', (e) => {
  e.target.classList.toggle('open');
  nav.classList.toggle('open');
});

document.querySelector('.menu') && document.querySelector('.menu').addEventListener('click', (e) => {
  nav.classList.remove('open');
  document.querySelector('.hamburger-menu').classList.remove('open');
});

// vh fix for mobile browsers
function setVh(name) {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty(`--${name || ''}vh`, `${vh}px`);
}

setVh('initial');
setVh();
buildSectionMap();

window.addEventListener('resize', () => {
  buildSectionMap();
  setVh();
});