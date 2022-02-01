const uid = new ShortUniqueId();

let addBtn = document.querySelector(".add-btn-cont");
let removeBtn = document.querySelector(".remove-btn-cont");
let modalCont = document.querySelector(".modal-cont");
let mainCont = document.querySelector(".main-cont");
let textareaCont = document.querySelector(".textarea-cont");
let allPriorityColor = document.querySelectorAll(".priority-color")
let toolBoxColor = document.querySelectorAll(".color");

let lockClass = 'fa-lock';
let unlockClass = 'fa-lock-open';

let colors = ["lightpink", "lightblue", "lightgreen", "black"];
let modalPriorityColor = colors[colors.length - 1];

let addFlag = false;
let removeFlag = false;

let ticketsArr = [];

if (localStorage.getItem("jira-tickets")) {
   //retrieve and display tickets 
   ticketsArr = JSON.parse(localStorage.getItem("jira-tickets"));
   ticketsArr.forEach((ticketObj) => {
      createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId)
   })
}

for (let i = 0; i < toolBoxColor.length; i++) {
   toolBoxColor[i].addEventListener("click", (e) => {

      let currentToolBoxColor = toolBoxColor[i].classList[0];
      let filteredTickets = ticketsArr.filter((ticketObj, idx) => {
         return currentToolBoxColor === ticketObj.ticketColor;
      })
      // remove previous tickets
      let allTicketsCont = document.querySelectorAll(".ticket-cont");
      for (let i = 0; i < allTicketsCont.length; i++) {
         allTicketsCont[i].remove();
      }
      // display new filtered tickets
      filteredTickets.forEach((ticketObj, idx) => {
         createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
      })
   })
   toolBoxColor[i].addEventListener("dblclick", (e) => {
      // remove previous tickets
      let allTicketsCont = document.querySelectorAll(".ticket-cont");
      for (let i = 0; i < allTicketsCont.length; i++) {
         allTicketsCont[i].remove();
      }
      //display all tickets
      ticketsArr.forEach((ticketObj, idx) => {
         createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
      })
   })
}

allPriorityColor.forEach((colorElem, idx) => {
   colorElem.addEventListener("click", (e) => {
      allPriorityColor.forEach((priorityColorElem, idx) => {
         priorityColorElem.classList.remove("border");
      })
      colorElem.classList.add("border");
      modalPriorityColor = colorElem.classList[0];
   })
})

//******************************************* Event Listeners ***************************************************
addBtn.addEventListener("click", function (e) {
   // display modal
   // generate tickets
   // addFlag = true; -> show modal 
   // addFlag = false -> modal none
   addFlag = !addFlag;
   if (addFlag) {
      modalCont.style.display = "flex";
      mainCont.style.display = "none";
   } else {
      modalCont.style.display = "none";
   }
})
removeBtn.addEventListener("click", function (e) {
   removeFlag = !removeFlag;
   if (removeBtn.style.backgroundColor === "") {
      removeBtn.style.backgroundColor = "white";
   } else {
      removeBtn.style.backgroundColor = "";
   }

})
modalCont.addEventListener("keydown", (e) => {

   if (e.code === 'Enter' && textareaCont.value) {
      createTicket(modalPriorityColor, textareaCont.value);
      SetModalToDefault();
      addFlag = false;
      mainCont.style.display = "flex";
   }


})


//**************************************************Helpers function**************************************************************
function createTicket(ticketColor, ticketTask, ticketId) {
   let id = ticketId || uid();
   let ticketCont = document.createElement("div");
   ticketCont.setAttribute("class", "ticket-cont");
   ticketCont.innerHTML = `
         <div class="ticket-color ${ticketColor}"></div>
         <div class="ticket-id">#${id}</div>
         <div class="task-area" >${ticketTask}</div>
         <div class="ticket-lock">
         <i class="fas fa-lock"></i>
      </div>`;
   mainCont.appendChild(ticketCont);
   if (!ticketId) {
      ticketsArr.push({
         ticketColor,
         ticketId: id,
         ticketTask
      });
      localStorage.setItem("jira-tickets", JSON.stringify(ticketsArr));
   }
   handleRemoval(ticketCont, id);
   handleLock(ticketCont, id);
   ticketColorChanger(ticketCont, id);
}
function ticketColorChanger(ticket, id) {
   // get index from the tickets Array
   let ticketIdx = getTicketIdx(id);
   let ticketColor = ticket.querySelector(".ticket-color");
   // get ticket color idx
   ticketColor.addEventListener("click", (e) => {
      let currentColor = ticketColor.classList[1];
      let currentColorIdx = colors.findIndex((color) => {
         return currentColor === color;
      })
      currentColorIdx++;
      let newColorIdx = currentColorIdx % colors.length;
      let newColor = colors[newColorIdx];
      ticketColor.classList.remove(currentColor);
      ticketColor.classList.add(newColor);
      // modify data in local Storage (priority color change)
      ticketsArr[ticketIdx].ticketColor = newColor;
      //modify data in browser storage
      localStorage.setItem("jira-tickets", JSON.stringify(ticketsArr));
   })
}
function handleRemoval(ticket, id) {
   // removeFlag -> truee -> remove
   ticket.addEventListener("click", (e) => {
      if (!removeFlag) return;
      let idx = getTicketIdx(id);
      ticketsArr.splice(idx, 1); // database removal
      localStorage.setItem("jira-tickets", JSON.stringify(ticketsArr));
      ticket.remove(); //ui removal
   })
}
function handleLock(ticket, id) {
   let ticketLockElem = ticket.querySelector(".ticket-lock");
   let ticketLock = ticketLockElem.children[0];
   let ticketTaskArea = ticket.querySelector(".task-area");
   ticketLock.addEventListener("click", (e) => {
      let ticketIdx = getTicketIdx(id);
      if (ticketLock.classList.contains(lockClass)) {
         ticketLock.classList.remove(lockClass);
         ticketLock.classList.add(unlockClass);
         ticketTaskArea.setAttribute("contentEditable", 'true');
      } else {
         ticketLock.classList.remove(unlockClass);
         ticketLock.classList.add(lockClass);
         ticketTaskArea.setAttribute("contentEditable", 'false');
      }
      ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
      localStorage.setItem("jira-tickets", JSON.stringify(ticketsArr));
   })
}
function SetModalToDefault() {
   modalCont.style.display = "none";
   textareaCont.value = "";
   modalPriorityColor = colors[colors.length - 1];
   allPriorityColor.forEach((priorityColorElem, idx) => {
      priorityColorElem.classList.remove("border");
   })
   allPriorityColor[allPriorityColor.length - 1].classList.add("border");
}
function getTicketIdx(idx) {
   let ticketIdx = ticketsArr.findIndex((ticketObj) => {
      return ticketObj.ticketId === idx;
   })
   return ticketIdx;
}