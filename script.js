function matrixParse(string) {

  let isValid = /^[A-Z]=\[(-?\d ?(; )?)+\]$/g.test(string);

  if (!isValid) {
    throw new Error('Can\'t read matrix');
  }

  let name = string[0];
  let ranges = string.match(/(-?\d ?)+/g);

  let matrix = ranges.map(r =>
    r.split(' ').map(num => Number(num))
  );

  return {
    [name]: matrix
  }
}

function matrixStringify(matrix) {
  let result = matrix.map( row =>
    row.join(' ')
  ).join('; ');

  result = `[${result}]`;

  return result;
}

function subtraction(x, y) {
  let columnsX = x[0].length;
  let rowsX = x.length;

  let columnsY = y[0].length;
  let rowsY = y.length;

  if (columnsX !== columnsY || rowsX !== rowsY) {
    throw new Error(`Can't perform subtraction`);
  }

  let result = [];
  for (let i = 0; i < rowsX; i++) {
    result.push(new Array(columnsX));
  }

  for (let i = 0; i < rowsX; i++) {
    for (let j = 0; j < columnsX; j++) {
      result[i][j] = x[i][j] - y[i][j];
    }
  }

  return result;
}

function addition(x, y) {
  let columnsX = x[0].length;
  let rowsX = x.length;

  let columnsY = y[0].length;
  let rowsY = y.length;

  if (columnsX !== columnsY || rowsX !== rowsY) {
    throw new Error(`Can't perform addition`);
  }

  let result = [];
  for (let i = 0; i < rowsX; i++) {
    result.push(new Array(columnsX));
  }

  for (let i = 0; i < rowsX; i++) {
    for (let j = 0; j < columnsX; j++) {
      result[i][j] = x[i][j] + y[i][j];
    }
  }

  return result;
}

function multiplication(x, y) {
  let columnsX = x[0].length;
  let rowsX = x.length;

  let columnsY = y[0].length;
  let rowsY = y.length;

  if (columnsX !== rowsY) {
    throw new Error(`Can't perform multiplication`);
  }

  let result = [];
  for (let i = 0; i < rowsX; i++) {
    result.push(new Array(columnsY));
  }

  for (let i = 0; i < rowsX; i++) {
    for (let j = 0; j < columnsY; j++) {

      result[i][j] = 0;

      for (let a = 0; a < columnsX; a++) {
        result[i][j] += x[i][a] * y[a][j];
      }
    }
  }

  return result;
}

function sourceDataParse(source) {
  let strings = source.split('\n');
  strings = strings.map( item => item.trim());

  let matrices = {};
  let operationLine = '';

  for (let i = 0; i < strings.length; i++) {
    let string = strings[i];

    if (string === '') {
      operationLine = strings[i+1];

      let isValid = /^([A-Z][+*-])+[A-Z]$/.test(operationLine);
      if (!isValid) {
        throw new Error('Operation line is not valid');
      }
      break;
    }

    Object.assign(matrices, matrixParse(string));
  }

  return {
    matrices: matrices,
    operationLine: operationLine,
  }
}

function operationLineParse(string) {
  const operationsPriority = ['*', '+-'];

  operationsPriority.forEach( currOp => {
    const regOperation = new RegExp(`([\\w(),\\[\\]']+[${currOp}][\\w(),\\[\\]']+)`,'g');
    const regOperands = /([\w(),\[\]']+)/g;

    let operation = string.match(regOperation);
    while (operation !== null) {
      let str = operation[0];
      let operands = str.match(regOperands).map(operand => {
          if (operand.length === 1) {
            return `matrices['${operand}']`;
          }
          return operand;
      });
      let currSign = str.match(/[+*-]/)[0];

      let operationName = '';
      switch (currSign) {
        case '+' :
          operationName = 'addition';
          break;

        case '-' :
          operationName = 'subtraction';
          break;

        case '*' :
          operationName = 'multiplication';
          break;
      }

      let replace = `${operationName}(${operands[0]},${operands[1]})`;

      string = string.replace(str, replace);

      operation = string.match(regOperation);
    }
  });

  return string;
}

function checkExistenceMatrices(matrices, operations) {
  let matrixNames = operations.split(/[+*-]/).reduce( (buf, item) => {
    if (!buf.includes(item)) {
      buf.push(item);
    }
    return buf;
  }, []);

  for (let i = 0; i < matrixNames.length; i++) {
    let isExist = matrices.hasOwnProperty(matrixNames[i]);
    if (!isExist) {
      throw new Error(`Matrix "${matrixNames[i]}" does not exist`)
    }
  }

  return true
}

function main() {
  resultElement.value = '';
  let sourceData = inputElement.value;

  try {
    let { matrices, operationLine } = sourceDataParse(sourceData);
    checkExistenceMatrices(matrices, operationLine);
    let resultMatrix = eval(operationLineParse(operationLine));
    resultElement.value = matrixStringify(resultMatrix);
  } catch (e) {
    alert(e.message);
  }
}

const inputElement = document.getElementById('input');
const resultElement = document.getElementById('result');
const button = document.getElementById('button');

button.addEventListener('click', main);
