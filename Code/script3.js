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
      
      if (!expression) {
        document.getElementById('result').innerHTML = 'Masukkan ekspresi terlebih dahulu';
        return;
      }
      
      try {
        let currentExpr = expression;
        let results = [];
        
          currentExpr = findDerivative(currentExpr);
          const formatted = formatWithSuperscript(currentExpr);
          results.push(`f(x) = ${formatted}`);
          
          
        
        
        document.getElementById('result').innerHTML = results.join('<br>');
      } catch (e) {
        document.getElementById('result').innerHTML = 'Error: Ekspresi tidak valid';
        console.error(e);
      }
    }
    
    function findDerivative(expr) {
      
      expr = expr.replace(/\s+/g, '');
      
      
      const terms = expr.split(/(?=[+-])/);
      let resultTerms = [];
      
      for (let term of terms) {
        if (!term) continue;
        
        
        let coefficient = 1;
        let exponent = 1;
        let xIndex = term.indexOf('x');
        
        if (xIndex === -1) {
          
          continue;
        }
        
        
        if (xIndex > 0) {
          const coeffStr = term.substring(0, xIndex);
          if (coeffStr === '+') coefficient = 1;
          else if (coeffStr === '-') coefficient = -1;
          else coefficient = parseFloat(coeffStr);
        }
        
        
        const caretIndex = term.indexOf('^', xIndex);
        if (caretIndex !== -1) {
          exponent = parseFloat(term.substring(caretIndex + 1));
        }
        
        
        const newCoefficient = coefficient * exponent;
        const newExponent = exponent - 1;
        
        
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
        
        
        if (newTerm && term[0] === '-' && newTerm[0] !== '-') {
          newTerm = '-' + newTerm;
        } else if (newTerm && term[0] !== '-' && newTerm[0] !== '-') {
          newTerm = '+' + newTerm;
        }
        
        if (newTerm) {
          resultTerms.push(newTerm);
        }
      }
      
      
      let result = resultTerms.join('');
      
      
      if (result.startsWith('+')) {
        result = result.substring(1);
      }
      
      if (result === '') {
        return '0';
      }
      
      return result;
    }
    
    function formatWithSuperscript(expr) {
      
      return expr.replace(/\^(\d+)/g, '<sup>$1</sup>');
    }
