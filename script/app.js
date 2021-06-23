const sections = document.querySelectorAll('.parallax-root');
const animations = [];

sections.forEach((section) => {
  section.querySelectorAll('.parallax').forEach((el) => {
    if (el.classList.contains("translate")) {
      animations.push({
        el: el,
        type: 'translate',
        offset: el.dataset.offset || 200,
        range: el.dataset.range || 500,
        axis: el.dataset.axis || 'y',
        mono: el.dataset.mono,
        root: section
      });
    }

    if (el.classList.contains("fade")) {
      animations.push({
        el: el,
        type: 'opacity',
        range: el.dataset.range || 500,
        mono: el.dataset.mono,
        root: section
      });
    }
  });
});

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

window.addEventListener('scroll', () => {
    const mutations = []; 
    var scrolling = false;
    const runMutations = () => mutations.forEach((m) => m());

    if (!scrolling && window.pageYOffset > 50) {
      document.querySelector('nav').classList.add('scrolling');
      scrolling = true;
    } else {
      document.querySelector('nav').classList.remove('scrolling');
      scrolling = false;
    }

    animations.forEach((anim) => {
      const el = anim.el;
      var amount =  clamp(anim.root.getBoundingClientRect().top, -anim.range, anim.range) / anim.range;

      if (anim.mono) {
        amount = clamp(amount, 0, 1);      }
  

      if (anim.type === 'translate') {
        mutations.push(() => el.style.transform = `translate${anim.axis.toUpperCase()}(${lerp(0.0, anim.offset, amount)}px)`);
      }

      if (anim.type === 'opacity') { 
        mutations.push(() => el.style.opacity = lerp(1.0, 0.0, Math.abs(amount)));
      }
    });

    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].getBoundingClientRect().top <= 0) {
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
});

var currentSection = "home";
document.body.classList.add(`current-${currentSection}`);