import config from './rio-config.js';
import {createChatProvider} from './chat-provider.js';
import {mountChat} from './chat-widget.js';
const {dialog,launch}=mountChat(config,createChatProvider());
document.querySelectorAll('[data-rio-guide-open]').forEach(b=>b.addEventListener('click',()=>launch.click()));
