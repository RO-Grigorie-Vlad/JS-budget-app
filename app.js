// Budget Controller
var budgetController = (function(){

    var Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value /totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    var calculateTotal =  function(type){
        var sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(type, des, val){
            var newItem,ID;

            //Create new ID:
            if(data.allItems[type].length === 0){
                // if there are no items, ID starts at 0
                ID = 0;
            }
            else{
                // if there are items, ID is incremented based on the last item's id
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            //Create new item based on 'inc' or 'exp' type
            if(type === "exp"){
                newItem = new Expense(ID, des, val);
            }
            else if(type === "inc"){
                newItem = new Income(ID, des, val);
            }
            //Push it into our data structure
            data.allItems[type].push(newItem);

            //Return the new element
            return newItem;
        },

        //Delete item from the data structure

        deleteItem : function(type,id){
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });

            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function(){

            // calculate total income and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;           

            // calculate the percentage
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){
            
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })

        },

        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }

        }
    }

})();

// UI Controller
var UIController = (function(){

    var DOMstring = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        addButton: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetValue: ".budget__value",
        budgetIncomeValue: ".budget__income--value",
        budgetIncomePercantage: "budget__income--percentage",
        budgetExpensesValue: ".budget__expenses--value",
        budgetExpensesPercantage: ".budget__expenses--percentage",
        container: ".container",
        expensesPercentageLabel: ".item__percentage",
        month: ".budget__title--month"
    };

    
    var nodeListForEach = function(list, callback){
        for(var i = 0; i <list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMstring.inputType).value,
                    // will be either inc or exp
                description: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
            }
        },
        
        addListItem: function(obj, type){

            var html, newHtml, element;

            // Create HTML string with placeholder text
            if(type ==='inc'){
                element = DOMstring.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else{
                element = DOMstring.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder test with some actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", obj.value);

            // Insert the HTML into the DOM

            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
            
        },

        deleteListItem: function(selectorID){

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        displayBudget: function(obj){

            document.querySelector(DOMstring.budgetValue).textContent = obj.budget;
            document.querySelector(DOMstring.budgetIncomeValue).textContent = obj.totalIncome;
            document.querySelector(DOMstring.budgetExpensesValue).textContent = obj.totalExpenses;
            
            if(obj.percentage <= 0){
                document.querySelector(DOMstring.budgetExpensesPercantage).textContent = '---';
            }else{
                document.querySelector(DOMstring.budgetExpensesPercantage).textContent = obj.percentage + '%';
            }
           
        },
        
        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstring.expensesPercentageLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                }
                else{
                    current.textContent = "---";
                }
            });

        },

        clearFields: function(){
            var fields;
            fields = document.querySelectorAll(DOMstring.inputValue + ', ' + DOMstring.inputDescription);

            for (var i = 0; i < fields.length; i ++) {
                fields[i].value = "";    
            }

            fields[0].focus();
        },

        displayMonth: function(){
            var now = new Date();
            var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
            ];
            document.querySelector(DOMstring.month).textContent = monthNames[now.getMonth()];
        },

        changedType: function(){
            var fields = document.querySelectorAll(DOMstring.inputType + "," + DOMstring.inputDescription + "," + DOMstring.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle("red-focus");
            });

            document.querySelector(DOMstring.addButton).classList.toggle('red');
        },

        getDOMstrings: function(){
            return DOMstring;
        }
    }

})();

// Global App Controller
var controller = (function(budgetCtrl, UICtrl){

    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.addButton).addEventListener("click", ctrlAddItem);

        document.addEventListener("keypress", function(event){
            if(event.key === "Enter" || event.code === 13){
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    };

    var updatePercentages = function(){

        // calculate percentages
        budgetCtrl.calculatePercentages();

        // read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    };

    var updateBudget = function(){

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function(){

        var input, newItem;

        // 1. get field input data
        input = UICtrl.getInput();

        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            // 2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type)

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(event){

        var itemID, splitID,type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
            //delete the item from the data structure
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]);

            //delete the item from the UI
            budgetCtrl.deleteItem(type, id);
            UICtrl.deleteListItem(itemID);

            //update the budget
            updateBudget();

            //calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function(){
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();