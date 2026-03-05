const themeSwitcher = document.getElementById("themeSwitcher");

themeSwitcher.addEventListener("change", () => {
  document.body.dataset.theme = themeSwitcher.value;
  localStorage.setItem("theme", themeSwitcher.value);
});

// ページ読み込み時に保存テーマ適用
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.body.dataset.theme = savedTheme;
    themeSwitcher.value = savedTheme;
  }
});