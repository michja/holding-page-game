const stage = document.querySelector('.stage');
const track = stage.querySelector('.track');
const disc = document.querySelector('.disc');
const modal = document.querySelector('.modal');
const ship = document.querySelector('.ship');
const clip = document.querySelector('.clip');
const overlay = document.querySelector('.overlay');

let running; //is the game in progress?
let winner; //has the game been won?


function fade(el) {
  el.classList.add('is-faded');
}

function scale(el) {
  el.classList.add('is-small');
}

function bounce(el, time=3) {
  el.style.animationDuration = `${time}s`;
  el.classList.add('is-moving');
}

function loadClip() {
  for (let i = 0; i < clip.dataset.shots; i++) {
    const laser = document.createElement('div');
    laser.classList.add('laser');
    clip.appendChild(laser);
  }
  clip.classList.remove('is-faded');
}

function moveShip() {
  bounce(ship, 2);
}

function lose() {

  overlay.addEventListener("transitionend", e => {
    if (e.propertyName !== "transform") return;
    setTimeout(() => {
      overlay.classList.remove('is-ended');
      disc.classList.add('is-faded');
      end();
      
    }, 500);
  });

  overlay.classList.add('is-active');
  setTimeout(() => {
    overlay.classList.add('is-ended');
  }, 20);
  ship.classList.add("is-dead");

}

function end() {
  modal.classList.remove("is-faded");
  ship.classList.add("is-faded");
  clip.classList.add("is-faded");
  modal.classList.add("is-ended");
}

function win() {
  end();
}

function removeShot() {
  const lasers = clip.querySelectorAll(".laser:not(.is-faded)");
  if (!lasers.length) return; //clip is empty

  const index = lasers.length - 1
  const laser = lasers[index];
  fade(laser);
  if (index == 0) {
     running = false;
    }
  laser.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "opacity") return;
    clip.removeChild(laser);

  });
}



function fire() {
  const laser = document.createElement('div');
  laser.classList.add('laser', 'is-active');
  laser.style.left = `${ship.offsetLeft + ship.width / 2}px`;
  track.appendChild(laser);

  monitor(laser);
  removeShot();
  laser.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "bottom") return;
      removeLaser(laser);
      const lasers = stage.querySelectorAll(".laser:not(.is-faded)");

      if (!lasers.length) {
        lose();
      }
  });

  setTimeout( () => laser.classList.add('is-firing'), 50);

}


function randomTime(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function wrap(el) {
  const wrap = document.createElement("div");
  const bounds = el.getBoundingClientRect();
  wrap.classList.add("wrap");
  wrap.style.left = `${bounds.left}px`;
  wrap.style.top = `${bounds.top}px`;
  wrap.style.height = `${bounds.height}px`;
  wrap.style.width = `${bounds.width}px`;
  track.removeChild(el);
  wrap.appendChild(el);
  stage.appendChild(wrap);

}

function removeLaser(laser) {
  if ("interval" in laser.dataset) window.clearInterval(laser.dataset.interval);
  track.removeChild(laser);
}




function explode(x,y,total) {
  const array = Array.apply(null, Array(total));
  const strings = array.map((el, i) => {
    const string = document.createElement("div");
    string.classList.add("string");
    string.style.top = `${y}px`;
    string.style.left = `${x}px`;
    string.style.transform = `rotate(${i * 360 / array.length}deg)`;
    return string;
  });
  strings.forEach((string) => {
    stage.appendChild(string);
    string.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "height") return;
      string.classList.add("shoot");

    });
    string.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "bottom" && running) return;
      running = false;
      win();

    });
    setTimeout( () => string.classList.add("stretch") , 50);
  });
}

function hit() {
  wrap(disc);
  disc.classList.remove("is-moving");



  setTimeout(()=> {
    disc.addEventListener("transitionend", (e) => {
      if (e.propertyName !== "transform") return;
        const bounds = disc.getBoundingClientRect();
        stage.removeChild(stage.querySelector(".wrap"));

        explode(bounds.left, bounds.top, 16);
    });
    disc.classList.add("is-shrunk");
  }, 50); //doesnt seem to work if added immediately
}

function start(e) {
  if (e.propertyName !== "transform") return;
  bounce(disc);
  ship.classList.add("is-shown");

  loadClip();
  disc.removeEventListener("transitionend", start);
  running = true;
}

function monitor(laser) {
  const id = setInterval( () => {
    const target = disc.getBoundingClientRect();
    const projectile = laser.getBoundingClientRect();
    if (projectile.top > target.top &&
         projectile.top < target.bottom &&
         projectile.left > target.left &&
         projectile.left < target.right) {

      removeLaser(laser);
      hit();

    }
  }, 50);
  laser.dataset.interval = id;
}

document.addEventListener("keydown", (e) => {
  if (!running || e.code !== "Space") return;
  fire();
});

document.addEventListener("touchstart", (e) => {
  if (!running) return;
  fire();
});

ship.addEventListener("transitionend", (e) => {
  if (e.propertyName !== "opacity") return;
  setTimeout( () => {
    moveShip();
  }, randomTime(10,1500));

});

setTimeout(() => {
  fade(modal);
  modal.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "opacity") return;
    scale(disc);
    disc.addEventListener("transitionend", start, {once: true});

  });
}, 1500);

