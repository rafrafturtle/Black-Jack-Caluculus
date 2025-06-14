 function append(value) {
      document.getElementById('display').value += value;
    }
    
    function clearDisplay() {
      document.getElementById('display').value = '';
      document.getElementById('result').innerHTML = 'Hasil turunan akan muncul di sini';
    }
    
    function backspace() {
      const display = document.getElementById('display');
      display.value = display.value.slice(0, -1);
    }
    
    function calculateDerivative() {
      const expression = document.getElementById('display').value;
      const order = parseInt(document.getElementById('derivativeOrder').value);
      
      if (!expression) {
        document.getElementById('result').innerHTML = 'Masukkan ekspresi terlebih dahulu';
        return;
      }
      
      try {
        let currentExpr = expression;
        let results = [];
        
        for (let i = 1; i <= order; i++) {
          currentExpr = findDerivative(currentExpr);
          const formatted = formatWithSuperscript(currentExpr);
          results.push(`f<sup>${i}</sup>(x) = ${formatted}`);
          
          // Jika hasilnya 0, tidak perlu lanjut ke turunan berikutnya
          if (currentExpr === '0') break;
        }
        
        document.getElementById('result').innerHTML = results.join('<br>');
      } catch (e) {
        document.getElementById('result').innerHTML = 'Error: Ekspresi tidak valid';
        console.error(e);
      }
    }
    
    function findDerivative(expr) {
      // Remove all whitespace
      expr = expr.replace(/\s+/g, '');
      
      // Split into terms
      const terms = expr.split(/(?=[+-])/);
      let resultTerms = [];
      
      for (let term of terms) {
        if (!term) continue;
        
        // Handle coefficient
        let coefficient = 1;
        let exponent = 1;
        let xIndex = term.indexOf('x');
        
        if (xIndex === -1) {
          // Constant term, derivative is 0
          continue;
        }
        
        // Get coefficient
        if (xIndex > 0) {
          const coeffStr = term.substring(0, xIndex);
          if (coeffStr === '+') coefficient = 1;
          else if (coeffStr === '-') coefficient = -1;
          else coefficient = parseFloat(coeffStr);
        }
        
        // Get exponent
        const caretIndex = term.indexOf('^', xIndex);
        if (caretIndex !== -1) {
          exponent = parseFloat(term.substring(caretIndex + 1));
        }
        
        // Calculate derivative term
        const newCoefficient = coefficient * exponent;
        const newExponent = exponent - 1;
        
        // Build term
        let newTerm = '';
        if (newCoefficient !== 1 && newCoefficient !== -1) {
          newTerm += newCoefficient.toString();
        } else if (newCoefficient === -1) {
          newTerm += '-';
        }
        
        if (newExponent !== 0) {
          newTerm += 'x';
          if (newExponent !== 1) {
            newTerm += '^' + newExponent;
          }
        }
        
        // Add sign if needed
        if (newTerm && term[0] === '-' && newTerm[0] !== '-') {
          newTerm = '-' + newTerm;
        } else if (newTerm && term[0] !== '-' && newTerm[0] !== '-') {
          newTerm = '+' + newTerm;
        }
        
        if (newTerm) {
          resultTerms.push(newTerm);
        }
      }
      
      // Combine terms
      let result = resultTerms.join('');
      
      // Clean up
      if (result.startsWith('+')) {
        result = result.substring(1);
      }
      
      if (result === '') {
        return '0';
      }
      
      return result;
    }
    
    function formatWithSuperscript(expr) {
      // Convert ^ to superscript
      return expr.replace(/\^(\d+)/g, '<sup>$1</sup>');
    }