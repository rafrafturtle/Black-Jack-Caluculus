// Hitung turunan pertama dari polinomial
function tambahPangkat() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return;

  const range = sel.getRangeAt(0);
  const sup = document.createElement("sup");
  sup.innerHTML = " ";
  range.insertNode(sup);
  
  // Pindahkan kursor ke dalam <sup>
  const newRange = document.createRange();
  newRange.selectNodeContents(sup);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

function hitungTurunanPolinomial() {
  const rawHtml = document.getElementById("polyInput").innerHTML;
  const plainText = rawHtml
    .replace(/<sup>(.*?)<\/sup>/g, "^$1")
    .replace(/<div>/g, "")
    .replace(/<\/div>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  const hasil = hitungTurunan(plainText);
  document.getElementById("polyResult").innerHTML = hasil || "Format tidak dikenali.";
}


// Tampilkan turunan dari fungsi trigonometri
function tampilkanTurunanTrigonometri() {
  const fungsi = document.getElementById("trigFunc").value;
  const turunan = {
    "sin(x)": "cos(x)",
    "cos(x)": "-sin(x)",
    "tan(x)": "sec²(x)"
  };
  document.getElementById("trigResult").innerText = turunan[fungsi] || "-";
}

// Hitung turunan pertama dan kedua dari input
function hitungTurunanKedua() {
  const input = document.getElementById("secondInput").value;
  const pertama = hitungTurunan(input);
  const kedua = hitungTurunan(pertama);
  document.getElementById("firstDeriv").innerText = pertama || "-";
  document.getElementById("secondDeriv").innerText = kedua || "-";
}

// Fungsi utama untuk menghitung turunan dari ekspresi polinomial
function hitungTurunan(ekspresi) {
  if (!ekspresi) return null;

  const suku = ekspresi.match(/([+-]?\s*\d*\s*x(\^\d+)?|[+-]?\s*\d+)/g);
  if (!suku) return null;

  const hasilTurunan = suku.map(bagian => {
    bagian = bagian.replace(/\s+/g, '');

    if (/x\^\d+/.test(bagian)) {
      const [, koef = '1', pangkat] = bagian.match(/([+-]?\d*)x\^(\d+)/);
      const k = parseFloat(koef === '+' || koef === '' ? 1 : (koef === '-' ? -1 : koef));
      const p = parseInt(pangkat);
      if (p === 0) return '0';

      const newKoef = k * p;
      const newPangkat = p - 1;

      let term = '';
      if (newKoef !== 0) {
        term = (newKoef === 1 && newPangkat !== 0) ? '' : (newKoef === -1 && newPangkat !== 0 ? '-' : newKoef.toString());
        if (newPangkat > 0) {
          term += 'x';
          if (newPangkat > 1) {
            term += '<sup>' + newPangkat + '</sup>';
          }
        }
      }
      return term;

    } else if (/x/.test(bagian)) {
      const koef = bagian.replace('x', '');
      const k = (koef === '' || koef === '+' ? 1 : (koef === '-' ? -1 : parseFloat(koef)));
      return k.toString();
    } else {
      return '0';
    }
  }).filter(term => term !== '0' && term !== '');

  if (hasilTurunan.length === 0) return '0';

  let hasil = hasilTurunan.join(' + ').replace(/\+\s\-/g, '- ');
  if (hasil.startsWith('+ ')) {
    hasil = hasil.slice(2);
  }

  return hasil;
}

    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('aktif', i === index);
      });
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    }