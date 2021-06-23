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
        root: section
      });
    }

    if (el.classList.contains("fade")) {
      animations.push({
        el: el,
        type: 'opacity',
        range: el.dataset.range || 500,
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
    animations.forEach((anim) => {
      const el = anim.el;
      const amount =  clamp(anim.root.getBoundingClientRect().top, -anim.range, anim.range) / anim.range;

      if (anim.type === 'translate') {
        el.style.transform = `translate${anim.axis.toUpperCase()}(${lerp(0.0, anim.offset, amount)}px)`;
      }

      if (anim.type === 'opacity') { 
        el.style.opacity = lerp(1.0, 0.0, Math.abs(amount));
      }
    });
});


/*

top = 0
range = 50



*/