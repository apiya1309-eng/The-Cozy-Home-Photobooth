JavaScript
const video = document.getElementById('video');
const canvas = document.getElementById('photo-canvas');
const uploadedView = document.getElementById('uploaded-view');
const uploadedContainer = document.getElementById('uploaded-container');
const uploadControls = document.getElementById('upload-controls');
const fileInput = document.getElementById('file-input');
const ctx = canvas.getContext('2d');
const snapBtn = document.getElementById('snap');
const resetBtn = document.getElementById('reset');
const nextBtn = document.getElementById('next-step');
const countdownDisplay = document.getElementById('countdown-text');
const filterBtns = document.querySelectorAll('.filter-btn');
const timeSelect = document.getElementById('time-select');

const zoomSlider = document.getElementById('zoom-slider');
const moveYSlider = document.getElementById('move-y-slider');

canvas.width = 800;
canvas.height = 600;
let selectedTime = 3;
let isUploadMode = false;

navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => { video.srcObject = stream; })
  .catch(err => console.log('Camera error: ' + err));

timeSelect.addEventListener('change', (e) => { selectedTime = parseInt(e.target.value); });

function updateImageTransform() {
  uploadedView.style.transform = `scale(${zoomSlider.value})`;
  uploadedView.style.objectPosition = `center ${moveYSlider.value}%`;
}

zoomSlider.addEventListener('input', updateImageTransform);
moveYSlider.addEventListener('input', updateImageTransform);

document.getElementById('mode-camera').addEventListener('click', () => {
  isUploadMode = false;
  video.style.display = 'block';
  uploadedContainer.style.display = 'none';
  uploadControls.style.display = 'none';
  canvas.style.display = 'none';
  nextBtn.style.display = 'none';
});

document.getElementById('mode-upload').addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      isUploadMode = true;
      uploadedView.src = event.target.result;
      uploadedContainer.style.display = 'block';
      uploadControls.style.display = 'flex';
      video.style.display = 'none';
      canvas.style.display = 'none';
      nextBtn.style.display = 'block'; 
      updateImageTransform();
    };
    reader.readAsDataURL(file);
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.getAttribute('data-filter');
    video.style.filter = f;
    uploadedView.style.filter = f;
    canvas.style.filter = f;
  });
});

snapBtn.addEventListener('click', () => {
  let count = selectedTime;
  snapBtn.disabled = true;
  countdownDisplay.innerText = count;
  const timer = setInterval(() => {
    count--;
    if (count > 0) {
      countdownDisplay.innerText = count;
    } else {
      clearInterval(timer);
      countdownDisplay.innerText = "SMILE!";
      setTimeout(() => { 
        takePhoto(); 
        countdownDisplay.innerText = ""; 
        snapBtn.disabled = false;
        nextBtn.style.display = 'block';
      }, 500);
    }
  }, 1000);
});

function takePhoto() {
  ctx.save();
  ctx.filter = getComputedStyle(isUploadMode ? uploadedView : video).filter;
  if (!isUploadMode) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  } else {
    const zoom = parseFloat(zoomSlider.value);
    const posY = parseFloat(moveYSlider.value) / 100;
    const imgW = uploadedView.naturalWidth;
    const imgH = uploadedView.naturalHeight;
    const sw = imgW / zoom;
    const sh = imgH / zoom;
    const sx = (imgW - sw) / 2;
    const sy = (imgH - sh) * posY; 
    ctx.drawImage(uploadedView, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  }
  ctx.restore();
  canvas.style.display = "block";
}

resetBtn.addEventListener('click', () => {
  canvas.style.display = "none";
  nextBtn.style.display = 'none';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});

nextBtn.addEventListener('click', () => {
  const sideControls = document.querySelector('.side-controls');
  const countdownTop = document.querySelector('.countdown-selector-top');
  const actionArea = document.querySelector('.action-buttons');
  const originalActionHTML = actionArea.innerHTML;

  sideControls.style.display = 'none';
  countdownTop.style.display = 'none';
  
  actionArea.innerHTML = `
    <h2 style="color:white; text-align:center; margin-bottom: 20px;">Design Your Frame!</h2>
    <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-bottom:30px; width: 100%;">
       <button class="filter-btn" style="padding:15px;" onclick="alert('Frame A selection')">Frame A</button>
       <button class="filter-btn" style="padding:15px;" onclick="alert('Frame B selection')">Frame B</button>
       <button class="filter-btn" style="padding:15px;" onclick="alert('Frame C selection')">Frame C</button>
    </div>
    <button class="capsule-btn" style="margin-bottom:15px;" onclick="alert('Saving Image...')">Save Image ✨</button>
    <button id="back-to-cam" class="mode-btn" style="width:100%; border:2px solid white;">← Back to Camera</button>
  `;

  document.getElementById('back-to-cam').addEventListener('click', () => {
    sideControls.style.display = 'flex';
    countdownTop.style.display = 'block';
    actionArea.innerHTML = originalActionHTML;
    location.reload(); // เคลียร์ทุกอย่างให้กลับมาเริ่มต้นใหม่ได้ชัวร์ที่สุดครับ
  });
});