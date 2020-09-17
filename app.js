/*************************************
 ************ CONTROLLERS ************
*************************************/

var budgetController = (function() {
    // Expense Data Structure
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    // Income Data Structure
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercents = function(income) {
        if (income > 0) this.percentage = Math.round(100 * (this.value / income));
        else this.percentage = -1;
    };

    Expense.prototype.getPercents = function() {
        return this.percentage;
    }

    // Information Data Structure
    var info = {
        budgetTotal: 0,
        percent: -1,
        moneyDetails: {
            exp: [],
            inc: []
        },
        moneyAmount: {
            exp: 0,
            inc: 0
        }
    };

    // Calculates the totals within info data structure
    var calculateTotals = function(type) {
        var tempSum = 0;
        info.moneyDetails[type].forEach(function(currElement) {
            tempSum += currElement.value;
        });

        info.moneyAmount[type] = tempSum;
    };

    return {
        // Add money to the respective data structure
        addMoney: function(type, desc, val) {
            var item, placement;
            if (info.moneyDetails[type].length == 0) placement = 0
            else placement = info.moneyDetails[type][info.moneyDetails[type].length - 1].id + 1;

            if (type === 'exp') item = new Expense(placement, desc, val);
            else item = new Income(placement, desc, val);

            info.moneyDetails[type].push(item);
            return item;
        },

        deleteMoney: function(type, numIndex) {
            var ids = info.moneyDetails[type].map(function(current) {
                return current.id;
            });
            
            var index = ids.indexOf(numIndex);

            if (index !== -1) {
                info.moneyDetails[type].splice(index, 1);
            }
        },

        calcBudget: function() {
            calculateTotals('exp');
            calculateTotals('inc');

            info.budgetTotal = info.moneyAmount.inc - info.moneyAmount.exp;
            if (info.moneyAmount.inc < info.moneyAmount.exp) {
                info.percent = -1;
            } else if (info.moneyAmount.inc > 0) {
                info.percent = Math.round(100 * (info.moneyAmount.exp / info.moneyAmount.inc));
            } else {
                info.percent = -1;
            }
        },

        calcPercs: function() {
            info.moneyDetails.exp.forEach(function(currEl) {
                currEl.calcPercents(info.moneyAmount.inc);
            });
        },

        getPercs: function() {
            var percentList = info.moneyDetails.exp.map(function(currEl) {
                return currEl.getPercents();
            })
            return percentList;
        },

        getBudget: function() {
            return {
                budgetTotal: info.budgetTotal,
                percentTotal: info.percent,
                expTotal: info.moneyAmount.exp,
                incTotal: info.moneyAmount.inc,
            }
        },

        testing: function() {
            console.log(info)
        }
    }
})();

var UIController = (function() {
    // Access to the respective HTML class
    var DOMstrings = {
        op: '.add__type',
        desc: '.add__description',
        value: '.add__value',
        addButt: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetVal: '.budget__value',
        incomeDisplay: '.budget__income--value',
        expenseDisplay: '.budget__expenses--value',
        expPercDisplay: '.budget__expenses--percentage',
        deleteContainerButt: '.container',
        perc: '.item__percentage',
        month: '.budget__title--month'
    };

    var reformatNum = function(type, number) {
        var individualPercent = '';
        number = Math.abs(number);
        number = number.toFixed(2);

        var numSplit = number.split('.');
        var wholeNum = numSplit[0];
        var decNum = numSplit[1];
        var length = wholeNum.length;

        if (length > 3 ) {
            var i = 0;
            var temp = length % 3;

            while (i < length) {
                if (i == 0 && temp !== 0) {
                    individualPercent += wholeNum.substring(i, i + temp);
                    i += temp;
                } else if (i == 0 && temp == 0) {
                    individualPercent += wholeNum.substring(i, i + 3);
                    i += 3;
                } else {
                    individualPercent += ',';
                    individualPercent += wholeNum.substring(i, i + 3);
                    i += 3;
                }
            }
        } else {
            individualPercent = wholeNum;
        }

        return (type === 'inc' ? '+' : '-') + ' ' + individualPercent + '.' + decNum;
    };

    var nodeListForEach = function(arrayList, callback) {
        for (let i = 0; i < arrayList.length; i++) {
            callback(arrayList[i], i);
        }
    };

    return {
        // Pulls respective HTML portion and stores into variables
        findInput: function() {
            return {
                type: document.querySelector(DOMstrings.op).value,
                description: document.querySelector(DOMstrings.desc).value,
                amount: parseFloat(document.querySelector(DOMstrings.value).value),
            };
        },

        // Adds information to a new container and updates UI
        addExpItem: function(obj, type) {
            if (type == 'inc') { 
                var item = DOMstrings.incomeList;
                var htmlPortion = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else { 
                var item = DOMstrings.expenseList;
                var htmlPortion = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
        }

            htmlReplace = htmlPortion.replace('%id%', obj.id);
            htmlReplace = htmlReplace.replace('%description%', obj.description);
            htmlReplace = htmlReplace.replace('%value%', reformatNum(type, obj.value));

            document.querySelector(item).insertAdjacentHTML('beforeend', htmlReplace);
        },

        deleteExpItem: function(objID) {
            var grabID = document.getElementById(objID);
            grabID.parentNode.removeChild(grabID);
        },

        // Empties input fields and resets input to description
        clearEntries: function() {
            var entries = document.querySelectorAll(DOMstrings.desc + ', ' + DOMstrings.value);
            var arrEntries = Array.prototype.slice.call(entries);

            arrEntries.forEach(function(arrCurr) {
                arrCurr.value = '';
            });

            arrEntries[0].focus();
        },

        showNewBudget: function(object) {
            var typeTemp = object.budgetTotal > 0 ? 'inc' : 'exp';

            document.querySelector(DOMstrings.budgetVal).innerHTML = reformatNum(typeTemp, object.budgetTotal); 
            document.querySelector(DOMstrings.incomeDisplay).innerHTML = reformatNum('inc', object.incTotal); 
            document.querySelector(DOMstrings.expenseDisplay).innerHTML = reformatNum('exp', object.expTotal);
            
            if (object.percentTotal !== -1) {
                document.querySelector(DOMstrings.expPercDisplay).innerHTML = object.percentTotal + '%';
            } else {
                document.querySelector(DOMstrings.expPercDisplay).innerHTML = '---';
            }
        },

        showPercentsUI: function(arrList) {
            var percHTML = document.querySelectorAll(DOMstrings.perc);

            nodeListForEach(percHTML, function(currEl, index) {
                if (arrList[index] > 0) {
                    currEl.textContent = arrList[index] + '%';
                } else {
                    currEl.textContent = '---';
                }
            });
        },

        showMonth: function() {
            var monthList = {
                1: 'January',
                2: 'February',
                3: 'March',
                4: 'April',
                5: 'May',
                6: 'June',
                7: 'July',
                8: 'August',
                9: 'September',
                10: 'October',
                11: 'November',
                12: 'December'
            }
            var current = new Date();
            var currYear = current.getFullYear();
            var currMonth = current.getMonth();
            document.querySelector(DOMstrings.month).textContent = monthList[currMonth] + ' ' + currYear;
        },

        changeColorType: function() {
            var sections = document.querySelectorAll(
                DOMstrings.op + ',' +                
                DOMstrings.desc + ',' +
                DOMstrings.value
            );

            nodeListForEach(sections, function(currEl) {
                currEl.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.addButt).classList.toggle('red');

        },

        // Shares HTML with mainController
        getDOM: function() {
            return DOMstrings;
        }
    };
})();

var mainController = (function (budgetCtrl, UICtrl) {
    var setupEventListeners = function() {
        var uiDOM = UICtrl.getDOM();

        document.querySelector(uiDOM.addButt).addEventListener('click', newItem);
        document.addEventListener('keydown', function (event) {
            if (event.code === 'Enter') {
                newItem();
            }
        });

        document.querySelector(uiDOM.deleteContainerButt).addEventListener('click', deleteItem);

        document.querySelector(uiDOM.op).addEventListener('change', UICtrl.changeColorType);
    };

    var update = function() {
        updateBudget();
        updatePercents();
    };

    var updateBudget = function() {
        budgetCtrl.calcBudget();
        var budgetObject = budgetCtrl.getBudget();
        UICtrl.showNewBudget(budgetObject);
    };

    var updatePercents = function() {
        budgetCtrl.calcPercs();
        var percList = budgetCtrl.getPercs();
        UICtrl.showPercentsUI(percList);
    };

    // Shares and updates new UI Controller information with Budget Controller
    var newItem = function() {
        // Grabs the HTML values and stores into variable
        var inputField = UICtrl.findInput();

        if (inputField.description !== "" && inputField.amount > 0 && !isNaN(inputField.amount)) {
            // Adds above variable to budget Controller 
            var storeBudget = budgetCtrl.addMoney(inputField.type, inputField.description, inputField.amount);
            
            // Adds Income/Expenses to the UI
            UICtrl.addExpItem(storeBudget, inputField.type);
            
            // Clears the entry
            UICtrl.clearEntries();

            // Update
            update();
        }
    };
    var deleteItem = function(event) {
        var pNodeID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (pNodeID) {
            split = pNodeID.split('-');
            var type = split[0];
            var num = parseInt(split[1]);

            // Delete from Budget Controller
            budgetCtrl.deleteMoney(type, num);

            // Delete from UI Controller
            UICtrl.deleteExpItem(pNodeID);

            // Update
            update();
        }
    };

    return {
        // Starts the entire program
        init: function() {
            console.log('App has started.');
            UICtrl.showMonth();
            UICtrl.showNewBudget({
                budgetTotal: 0,
                percentTotal: -1,
                expTotal: 0,
                incTotal: 0
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);


/*************************************
 ********** CODE RUNS HERE **********
*************************************/

mainController.init();
