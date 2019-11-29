const key = '__current_style__';

const store = {
  value: 'default',
  get() {
    return this.value;
  },
  set(val) {
    try {
      this.value = val;
      window.localStorage.setItem(key, val);
    } catch (e) { /* 静默处理 */ }
  },
};

try {
  const localValue = window.localStorage.getItem(key);
  if (localValue) store.value = localValue;
} catch (e) { /* 静默处理 */ }

export default store;
