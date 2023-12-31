(function() {
    // создаем и возвращаем заголовок приложения
    function createAppTitle(title) {
        let appTitle = document.createElement('h2');
        appTitle.innerHTML = title;
        return appTitle;
    }

    // создаем и возвращаем форму для создания дела
    function createTodoItemForm() {
        let form = document.createElement('form');
        let input = document.createElement('input');
        let buttonWrapper = document.createElement('div');
        let button = document.createElement('button');

        form.classList.add('input-group', 'mb-3');
        input.classList.add('form-control');
        input.placeholder = 'Введите название нового дела';
        buttonWrapper.classList.add('input-group-append');
        button.classList.add('btn', 'btn-primary');
        button.textContent = "Добавить дело";

        buttonWrapper.append(button);
        form.append(input);
        form.append(buttonWrapper);

        return {
            form,
            input,
            button
        };
    }

    // создаем и возвращаем список элементов
    function createTodoList() {
        let list = document.createElement('ul');
        list.classList.add('list-group');
        return list;
    }
    
    function createTodoItemElement(todoItem, { onDone, onDelete }) {
        const doneClass = 'list-group-item-success';
        let item = document.createElement('li');
        // кнопки помещаем в элемент, который красиво покажет их в одной группе 
        let buttonGroup = document.createElement('div');
        let doneButton = document.createElement('button');
        let deleteButton = document.createElement('button');
    
        // устанавливаем стили для элемента списка, а также для размещения кнопок
        // в его правой части с помощью flex
        item.classList.add('list-group-item', 
                           'd-flex', 
                           'justify-content-between',
                           'align-items-center');
        if (todoItem.done) {
            item.classList.add(doneClass);
        }
        item.textContent = todoItem.name;
    
        buttonGroup.classList.add('btn-group', 'btn-group-sm');
        doneButton.classList.add('btn', 'btn-success');
        doneButton.textContent = "Готово";
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.textContent = "Удалить";

        //Добавляем обработчики на кнопки
        doneButton.addEventListener('click', function() {
            onDone({ todoItem, element: item });
            item.classList.toggle(doneClass, todoItem.done);
        });
        deleteButton.addEventListener('click', function() {
            onDelete({ todoItem, element: item  });
        });
    
        buttonGroup.append(doneButton);
        buttonGroup.append(deleteButton);
        item.append(buttonGroup);
    
        return item;
    }

    async function createTodoApp(container, title, owner) {
        let todoAppTitle = createAppTitle(title);
        let todoItemForm = createTodoItemForm();
        let todoList = createTodoList();
        const url = 'http://localhost:3000/api/todos';
        const headers = { 'Content-Type': 'application/json' };
        
        const handlers = {
            onDone({ todoItem }) {
                todoItem.done = !todoItem.done;
                console.log(todoItem.id);
                fetch(url + '/' + todoItem.id, {
                    method: 'PATCH',
                    headers: headers,
                    body: JSON.stringify({ done: todoItem.done }),
                });
            },
            onDelete({ todoItem, element }) {
                if (!confirm('Вы уверены?')) {
                    return;
                }
                console.log(todoItem.id);
                element.remove();
                fetch (url + '/' + todoItem.id, {
                    method: 'DELETE',
                    headers: headers,
                });
            },
        };
        container.append(todoAppTitle);
        container.append(todoItemForm.form); 
        container.append(todoList);

        const responce = await fetch(url + '?owner='+ owner);
        const todoItemList = await responce.json() 

        todoItemList.forEach(todoItem => {
            const todoItemElement = createTodoItemElement(todoItem, handlers);
            todoList.append(todoItemElement);
        });
        
        // браузер создает событие submit на форме по нажатию на Enter

        todoItemForm.form.addEventListener('submit', async function(e) {
            e.preventDefault();
            // игнорируем создание элемента, если пользоватеьл ничего не ввел
            if (!todoItemForm.input.value) {
                return;
            }

            const responce = await fetch(url, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: todoItemForm.input.value.trim(),
                    owner,
                })
            });

            const todoItem = await responce.json()

            let todoItemElement = createTodoItemElement(todoItem, handlers);

            
            // создаем и добавляем в список новое дело
            todoList.append(todoItemElement);

            todoItemForm.input.value = '';
        });
    }

    window.createTodoApp = createTodoApp;
})();