    let questions = [];

    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        questions = data.questions;
        renderQuestion(0);
        renderQuestion(1);
      })
      .catch(error => {
        console.error("Gagal memuat soal:", error);
      });

    function renderQuestion(index) {
      const q = questions[index];
      if (!q) return;

      document.getElementById(`question-text-${index + 1}`).innerText = q.text;
      const container = document.getElementById(`choices-container-${index + 1}`);
      container.innerHTML = '';

      q.choices.forEach((choice, i) => {
        const div = document.createElement('div');
        div.className = 'choice';
        div.innerHTML = `
          <label>
            <input type="radio" name="choice-${index}" value="${i}">
            ${choice}
          </label>
        `;
        container.appendChild(div);
      });
    }

    function submitAnswer(index) {
      const radios = document.getElementsByName(`choice-${index}`);
      let selectedIndex = -1;
      for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
          selectedIndex = parseInt(radios[i].value);
          break;
        }
      }

      const feedback = document.getElementById(`feedback-${index + 1}`);
      const explanation = document.getElementById(`explanation-${index + 1}`);

      if (selectedIndex === -1) {
        feedback.innerText = 'Silakan pilih salah satu jawaban.';
        feedback.style.color = '#facc15';
        explanation.innerText = '';
        return;
      }

      const q = questions[index];

      if (selectedIndex === q.correctIndex) {
        feedback.innerText = 'Jawaban kamu benar!';
        feedback.style.color = '#10b981';
      } else {
        feedback.innerText = 'Jawaban kamu masih salah.';
        feedback.style.color = '#ef4444';
      }

      explanation.innerText = q.explanations[selectedIndex];
    }

     document.querySelectorAll('section, .quiz-container-1, .quiz-container-2').forEach((el) => {
    el.classList.add('reveal');
  });

  function revealOnScroll() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach((el) => {
      const windowHeight = window.innerHeight;
      const elementTop = el.getBoundingClientRect().top;
      const revealPoint = 100;

      if (elementTop < windowHeight - revealPoint) {
        el.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', revealOnScroll);
  window.addEventListener('load', revealOnScroll);

  