const input = document.querySelector('.input');
const autocomplete = document.querySelector('.autocomplete');
const reposList = document.querySelector('.repos-list');

const debounce = (fn, debounceTime) => {
  let timerId;

  function wrapper() {
    const foo = () => fn.apply(this, arguments);

    clearTimeout(timerId);

    timerId = setTimeout(foo, debounceTime);
  }

  return wrapper;
};

let repositories;
const debouncedGetRepos = debounce(getRepos, 200);

async function getRepos(e) {
  clear();
  let inputValue = e.target.value;

  if(inputValue.trim() === '') {
    return;
  }

  const response = await fetch(`https://api.github.com/search/repositories?q=${inputValue}in:name&per_page=5&sort=stars`)
  repositories = (await response.json()).items;
  createAutocomplete(repositories);

}

function createAutocomplete(repositories) {
  const fragment = document.createDocumentFragment();
  for (let { name, id } of repositories) {
    const item = document.createElement('li');
    const itemLink = document.createElement('a');
    itemLink.textContent = name;
    itemLink.href = '#';
    itemLink.id = id;
    item.append(itemLink);
    fragment.append(item);
  }
  clear();
  autocomplete.append(fragment);
}

function clear() {
  let children = [...autocomplete.children];
  for (let i = 0; i < children.length; i++) {
    children[i].remove();
  }
}

function createReposList(targetId) {
  const [repo] = repositories.filter(({ id }) => id == targetId);
  const item = document.createElement('li');
  item.classList.add('repo');
  const itemBody = document.createElement('div');
  const name = document.createElement('div');
  const owner = document.createElement('div');
  const stars = document.createElement('div');
  name.textContent = `Name: ${repo.name}`;
  owner.textContent = `Owner: ${repo.owner.login}`;
  stars.textContent = `Stars: ${repo.stargazers_count}`;
  itemBody.append(name);
  itemBody.append(owner);
  itemBody.append(stars);
  item.append(itemBody);
  const buttonDelete = document.createElement('button');
  buttonDelete.classList.add('button-delete');
  item.append(buttonDelete);
  reposList.append(item);
}

input.addEventListener('input', debouncedGetRepos);

autocomplete.addEventListener('click', function (e) {
  e.preventDefault();
  const target = e.target;
  if (target.tagName === 'A') {
    createReposList(target.id);
    input.value = '';
    clear();
  }
})

reposList.addEventListener('click', function (e) {
  const target = e.target;

  if (target.tagName === 'BUTTON') {
    target.closest('.repo').remove();
  }
})