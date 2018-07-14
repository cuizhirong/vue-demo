Vue.component('todo-left', {
  props: ['todos', 'all', 'types', 'onopen', 'open', 'addsub', 'onaction'],
  data: function () {
    return {
      selectedTypes: [], //选中的分类
      checkedSubType: '', //选中的子类型
    };
  },
  methods: {
    //删除类型
    deleteType: function(type) {
      this.types.some((t, index) => {
        if (t.key === type.key) {
          this.types.splice(index, 1);
          return true;
        }

        return false;
      });
    },
    //点击选中类别
    onClick: function(type) {
      if (this.selectedTypes.indexOf(type) === -1) {
        this.selectedTypes.push(type);
      } else {
        this.selectedTypes.some((t, index) => {
          if (t.key === type.key) {
            this.selectedTypes.splice(index, 1);
            return true;
          }

          return false;
        })
      }
    },
    onCheckType: function(type) {
      this.onCheckType = type;
      this.onopen = false;
    },
    //选中子分类
    onSubtype: function(key, subKey) {
      this.checkedSubType = subKey;
      this.onaction(key, subKey);
    }
  },
  template: `<div>
    <div class="all">
      所有任务 ({{ todos.length }})
    </div>
    <div class="type-title">分类列表</div>
    <div
      v-for="type in types">
      <div class="type-name" @click="onClick(type)">
        {{ type.name }}
        <span @click="() => deleteType(type)">x</span>
      </div>
      <div
        v-bind:class="[selectedTypes.indexOf(type) !== -1 ? 'sub-type' : 'hide', checkedSubType === subType.key ? 'checked' : '']"
        v-for="subType in type.subType"
        @click="() => onSubtype(type.key, subType.key)">
        {{ subType.name }} ({{subType.num}})
      </div>
      <div 
        v-bind:class="[selectedTypes.indexOf(type) !== -1 ? 'sub-type' : 'hide']"
        @click="onCheckType(type)"
        >
        ＋添加子分类
      </div>
      <pop
        v-bind:open="open"
        v-bind:types="types"
        v-bind:addtype="(value) => addsub(value, type)"
      />
    </div>
  </div>`
});

Vue.component('todo-center', {
  props: ['alltodos', 'onselectedtodo'],
  data: function() {
    return {
      checkedStatus: 'all', //选中的todo状态的类别 是否完成
      checkedItem: {} //选中的todo
    };
  },
  computed: {
    todos: function() {
      let dateTodos = {}, availTodos = this.alltodos;
      if (this.checkedStatus === 'notComplete') {
        availTodos = this.alltodos.filter(todo => !todo.isCompleted);
      } else if (this.checkedStatus === 'completed') {
        availTodos = this.alltodos.filter(todo => todo.isCompleted);
      }
      availTodos.forEach(todo => {
        if (Object.keys(dateTodos).indexOf(todo.date.getTime().toString()) === -1) {
          dateTodos[todo.date.getTime()] = [];
        }
        dateTodos[todo.date.getTime()].push(todo);
      });

      return dateTodos;
    },
  },
  methods: {
    onSelectedTodo: function(todo) {
      this.checkedItem = todo;
      this.onselectedtodo(todo);
    }
  },
  template: `<div class="todo-center">
    <div class="type">
      <span
        v-bind:class="[checkedStatus === 'all' && 'checked']"
        @click="checkedStatus = 'all'">所有</span>
      <span
        v-bind:class="[checkedStatus === 'notComplete' && 'checked']"
        @click="checkedStatus = 'notComplete'">未完成</span>
      <span
        v-bind:class="[checkedStatus === 'completed' && 'checked']"
        @click="checkedStatus = 'completed'">已完成</span>
    </div>
    <div v-for="key in Object.keys(todos)">
      <div class="date">{{ todos[key][0].date.toLocaleDateString() }}</div>
      <div
        v-bind:class="['item', checkedItem.id === todo.id && 'checked']"
        v-for="todo in todos[key]"
        @click="onSelectedTodo(todo)">
        {{ todo.title }}
      </div>
    </div>
  </div>`
});

Vue.component('todo-right', {
  props: ['todo'],
  template: `<div class="todo-right" v-if="todo.id">
    <div class="title">
      <div class="title-letter">{{ todo.title }}</div>
      <div class="status">状态: {{ todo.isCompleted ? '已完成' : '未完成' }}</div>
      <div
        class="edit-status"
        @click="todo.isCompleted = !todo.isCompleted">
        {{ todo.isCompleted ? '修改为未完成' : '修改为已完成' }}
      </div>
    </div>
    <div class="date">任务日期：{{ todo.date.toLocaleDateString() }}</div>
    <div class="content">{{ todo.content }}</div>
  </div>`
});

Vue.component('pop', {
  props: ['open', 'types', 'addtype'],
  data: function() {
    return {
      typename: ''
    };
  },
  beforeUpdate: function() {
    if (!this.open) this.typename = '';
  },
  template: `
    <div class="pop-container"
      v-bind:class="{ hide: !open }">
      <div class="pop">
        <div class="pop-title">
          添加分类
          <span @click="() => addtype()">x</span>
        </div>
        <div class="pop-content">
          <div>名称:<input v-model="typename" placeholder="请输入名称"></div>
        </div>
        <button @click="() => addtype(typename)">添加</button>
      </div>
    </div>
  `
});

Vue.component('pop-task', {
  props: ['isaddtask', 'addtask'],
  data: function() {
    return {
      title: '',
      content: ''
    };
  },
  computed: {
    todo: function() {
      return {
        title: this.title,
        content: this.content,
        date: new Date()
      };
    }
  },
  beforeUpdate: function() {
    if (!this.isaddtask) {
      this.title = '';
      this.content = '';
    }
  },
  template: `<div class="pop-container"
    v-bind:class="{ hide: !isaddtask }">
    <div class="pop">
      <div class="pop-title">
        添加任务
        <span @click="addtask()">x</span>
      </div>
      <div class="pop-content">
        <div class="content">
          <span>标题:</span>
          <input v-model="title" placeholder="请输入标题">
        </div>
        <div class="content">
          <span>内容:</span>
          <textarea
            v-model="content"
            rows="10"
            placeholder="请输入内容">
          </textarea>
        </div>
      </div>
      <button v-bind:disabled="!title || !content" @click="() => addtask(todo)">添加</button>
    </div>
  </div>`
})