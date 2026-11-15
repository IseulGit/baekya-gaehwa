const $ = (selector) => document.querySelector(selector);
const el = (tag, text, className) => { const node = document.createElement(tag); if (text != null) node.textContent = text; if (className) node.className = className; return node; };
const menu = $('.menu-button');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); $('#nav').classList.toggle('open', open); });
$('#nav').addEventListener('click', (event) => { if (event.target.closest('a')) { menu.setAttribute('aria-expanded', 'false'); $('#nav').classList.remove('open'); } });
window.matchMedia('(min-width: 901px)').addEventListener('change', event => { if (event.matches) { menu.setAttribute('aria-expanded', 'false'); $('#nav').classList.remove('open'); } });
const profileImage = $('#profile-image');
profileImage.addEventListener('error', () => { profileImage.hidden = true; });
async function loadJSON(path) { const response = await fetch(path); if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); }
function showError(container) { container.textContent = '데이터를 불러오지 못했습니다. 웹 서버를 통해 페이지를 열고 다시 시도해 주세요.'; container.classList.add('data-note'); }
loadJSON('data/world.json').then(data => {
  data.factions.forEach(item => { const card = el('article', null, 'faction'); card.append(el('span', item.number, 'num'), el('h4', item.name), el('small', item.en), el('p', item.description)); $('#factions').append(card); });
  data.history.forEach(item => { const row = el('article', null, 'timeline-item'); const time = el('time', item.date); time.dateTime = item.date.replaceAll('.', '-'); row.append(time, el('h3', item.title), el('p', item.description)); $('#timeline').append(row); });
}).catch(() => { showError($('#factions')); showError($('#timeline')); });
loadJSON('data/characters.json').then(characters => {
  const faction = $('#faction-filter'), group = $('#group-filter'), list = $('#character-list');
  function options(select, values, label) { const previous = select.value; select.replaceChildren(new Option(label, '')); [...new Set(values)].sort((a,b) => a.localeCompare(b,'ko')).forEach(value => select.add(new Option(value, value))); if ([...select.options].some(option => option.value === previous)) select.value = previous; }
  options(faction, characters.map(c => c.faction), '전체 소속');
  function updateGroups() { options(group, characters.filter(c => !faction.value || c.faction === faction.value).map(c => c.group).filter(Boolean), '전체 그룹'); }
  function render() { const shown = characters.filter(c => (!faction.value || c.faction === faction.value) && (!group.value || c.group === group.value)); list.replaceChildren(); $('#character-count').textContent = `${shown.length} CHARACTERS`; if (!shown.length) list.append(el('p', '조건에 맞는 캐릭터가 없습니다.', 'data-note')); shown.forEach(c => { const card = el('button', null, 'character-card'); card.type = 'button'; card.setAttribute('aria-label', `${c.name} 프로필 보기`); const portrait = el('div', null, 'portrait'); const image = el('img'); image.src = c.image; image.alt = ''; image.loading = 'lazy'; image.addEventListener('error', () => { image.remove(); portrait.append(el('span', '✳')); }, { once: true }); portrait.append(image); card.append(portrait, el('h3', c.name), el('p', `${c.faction} / ${c.group}`)); card.addEventListener('click', () => { const profileImage = $('#profile-image'); profileImage.hidden = false; profileImage.src = c.image; profileImage.alt = `${c.name} 일러스트`; $('#profile-group').textContent = `${c.faction} / ${c.group}`; $('#profile-name').textContent = c.name; $('#profile-meta').textContent = [c.age ? `${c.age}세` : '', c.grade ? `${c.grade}학년` : ''].filter(Boolean).join(' · '); $('#profile-quote').textContent = c.quote ? `“${c.quote}”` : ''; $('#profile-quote').hidden = !c.quote; $('#profile-description').textContent = c.description || ''; $('#profile-personality').textContent = c.personality; $('#profile').showModal(); }); list.append(card); }); }
  faction.addEventListener('change', () => { updateGroups(); render(); }); group.addEventListener('change', render); updateGroups(); render();
}).catch(() => showError($('#character-list')));
$('#profile .close').addEventListener('click', () => $('#profile').close());
$('#profile').addEventListener('click', e => { if (e.target === $('#profile')) $('#profile').close(); });
