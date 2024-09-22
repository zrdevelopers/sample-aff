// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", function() {
  // Automatically show the modal after 5 seconds (5000 milliseconds)
  setTimeout(function() {
    var myModal = new bootstrap.Modal(document.getElementById('spinWheelModal'));
    myModal.show();
  }, 5000); // 5 seconds delay
});

// Start Kemenagan
function getRandomColor() {
  const colors = ['#FF5733', '#33FF57', '#3357FF', '#F0E68C', '#FF33F6']; // Tambahkan warna yang diinginkan
  return colors[Math.floor(Math.random() * colors.length)];
}

function createSnowflakes() {
  const snowflakeCount = 100; // Adjust the number of snowflakes
  const modalContent = document.querySelector('.modal-content');

  for (let i = 0; i < snowflakeCount; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snow';
      
      // Randomize the position
      snowflake.style.left = Math.random() * 100 + 'vw';
      
      // Randomize the animation duration
      snowflake.style.animationDuration = Math.random() * 3 + 2 + 's'; // Between 2s to 5s

      // Set a random color for the snowflake
      snowflake.style.backgroundColor = getRandomColor();
      
      modalContent.appendChild(snowflake);
      
      // Remove the snowflake after the animation
      snowflake.addEventListener('animationend', () => {
          snowflake.remove();
      });
  }
}

// Call createSnowflakes when the modal is shown
document.getElementById('winningModal').addEventListener('shown.bs.modal', createSnowflakes);
// Endd Kemenangan

const sectors = [
  { color: "#FFBC03", text: "#333333", label: "Voucher 10%" },
  { color: "#FF5A10", text: "#333333", label: "Cashback $5" },
  { color: "#FFBC03", text: "#333333", label: "Free Shipping" },
  { color: "#FF5A10", text: "#333333", label: "Voucher 20%" },
  { color: "#FFBC03", text: "#333333", label: "Gift Card $10" },
  { color: "#FF5A10", text: "#333333", label: "You lose" },
  { color: "#FFBC03", text: "#333333", label: "Voucher 15%" },
  { color: "#FF5A10", text: "#333333", label: "Discount 25%" },
];

const events = {
  listeners: {},
  addListener: function (eventName, fn) {
    this.listeners[eventName] = this.listeners[eventName] || [];
    this.listeners[eventName].push(fn);
  },
  fire: function (eventName, ...args) {
    if (this.listeners[eventName]) {
      for (let fn of this.listeners[eventName]) {
        fn(...args);
      }
    }
  },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const spinVal = document.querySelector("#spinValue");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0; // Angular velocity
let ang = 0; // Angle in radians

let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
  const ang = arc * i;
  ctx.save();

  // COLOR
  ctx.beginPath();
  ctx.fillStyle = sector.color;
  ctx.moveTo(rad, rad);
  ctx.arc(rad, rad, rad, ang, ang + arc);
  ctx.lineTo(rad, rad);
  ctx.fill();

  // TEXT
  ctx.translate(rad, rad);
  ctx.rotate(ang + arc / 2);
  ctx.textAlign = "right";
  ctx.fillStyle = sector.text;
  ctx.font = "bold 30px 'Lato', sans-serif";
  ctx.fillText(sector.label, rad - 10, 10);
  ctx.restore();
}

function rotate() {
  const sector = sectors[getIndex()];
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;

  if(angVel) {
    spinVal.textContent = sector.label;
    spinEl.textContent = "tunggu...";
  } else {
    spinEl.textContent = "SPIN";
  }
  spinEl.style.background = sector.color;
  spinVal.style.background = sector.color;
  spinEl.style.color = sector.text;
  
}

function frame() {
  // Fire an event after the wheel has stopped spinning
  if (!angVel && spinButtonClicked) {
    const finalSector = sectors[getIndex()];
    events.fire("spinEnd", finalSector); // Trigger the spinEnd event
    spinButtonClicked = false; // Reset the flag
    return;
  }

  angVel *= friction; // Decrement velocity by friction
  if (angVel < 0.002) angVel = 0; // Bring to stop
  ang += angVel; // Update angle
  ang %= TAU; // Normalize angle
  rotate();
}


function engine() {
  frame();
  requestAnimationFrame(engine);
}

function init() {
  sectors.forEach(drawSector);
  rotate(); // Initial rotation
  engine(); // Start engine

  spinEl.addEventListener("click", () => {
    if (spinButtonClicked || angVel) return; // Prevent multiple clicks during spin

    // Set target angle for "Voucher 20%"
    const targetIndex = 3; // Index of "Voucher 20%"
    const spins = 3; // Number of full spins before stopping
    const angleOffset = (TAU / tot) * targetIndex; // Angle for "Voucher 20%"

    // Calculate the total angle to spin
    const totalAngle = (spins * TAU) + angleOffset + (TAU / tot) / 2; // Spin more to create excitement

    // Disable the spin button to prevent further clicks
    spinEl.disabled = true;
    spinButtonClicked = false;
    
    if (!angVel) {
      spinButtonClicked = true; // Set the flag to prevent further clicks
      angVel = totalAngle / 50; // Set angular velocity for smooth spin
    }
  });
}

events.addListener("spinEnd", (sector) => {
  spinVal.textContent = sector.label;

  // Tampilkan pesan kemenangan di modal
  const winningMessage = document.querySelector("#winningMessage");
  winningMessage.textContent = `Selamat! Anda mendapatkan: ${sector.label}`;

  // Tampilkan modal kemenangan
  const winningModal = new bootstrap.Modal(document.getElementById('winningModal'));
  winningModal.show();

  // Re-enable the spin button after the spin ends
  spinEl.disabled = true; 
  spinButtonClicked = false; // Reset the flag
  console.log(`Woop! You won ${sector.label}`);
});

init();

