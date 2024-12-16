document.addEventListener('DOMContentLoaded', function() {
    const nameInput = document.getElementById("participantName");
    
    nameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // 폼 제출 방지
            addParticipant();
        }
    });
});

const MAX_ACTIVE_PARTICIPANTS = 4;

let activeParticipants = [];
let waitingParticipants = [];
let selectedWaiting = new Set();

function addParticipant() {
    const nameInput = document.getElementById("participantName");
    const name = nameInput.value.trim();
    const addMode = document.querySelector('input[name="addMode"]:checked').value;

    if (!name) {
        return;
    }

    if (addMode === 'waiting') {
        // 대기열 우선 모드: 빈자리가 있어도 대기열에 추가
        waitingParticipants.push(name);
    } else {
        // 자동 참여 모드: 빈자리가 있으면 참여중에 추가
        if (activeParticipants.length < MAX_ACTIVE_PARTICIPANTS) {
            activeParticipants.push(name);
        } else {
            waitingParticipants.push(name);
        }
    }

    nameInput.value = "";
    selectedWaiting.clear();
    updateLists();
}

function completeParticipation(index) {
    activeParticipants.splice(index, 1);

    if (waitingParticipants.length > 0) {
        activeParticipants.push(waitingParticipants.shift());
    }

    updateLists();
}

function updateLists() {
    const activeList = document.getElementById("activeParticipants");
    const waitingList = document.getElementById("waitingParticipants");
    const activeCount = document.getElementById("activeCount");

    activeList.innerHTML = "";
    waitingList.innerHTML = "";
    activeCount.textContent = activeParticipants.length;

    activeParticipants.forEach((name, index) => {
        const li = document.createElement("li");
        li.className =
            "flex items-center justify-between p-3 bg-secondary/50 backdrop-blur-sm rounded-lg hover:bg-secondary/70 transition duration-200 shadow-md group";
        li.innerHTML = `
            <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">${name}</span>
            <button onclick="completeParticipation(${index})" 
                    class="bg-primary hover:bg-primary/80 text-white px-4 py-1.5 rounded-lg text-sm transition duration-200 shadow-sm hover:shadow flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                참여완료
            </button>
        `;
        activeList.appendChild(li);
    });

    waitingList.innerHTML = "";
    waitingParticipants.forEach((name, index) => {
        const li = document.createElement("li");
        li.className = `flex items-center justify-between p-3 bg-secondary/50 backdrop-blur-sm rounded-lg 
                       ${
                           selectedWaiting.has(index)
                               ? "ring-2 ring-primary shadow-lg"
                               : "shadow-md"
                       }
                       hover:bg-secondary/70 transition duration-200 group`;
        li.innerHTML = `
            <div class="flex items-center gap-3">
                <input type="checkbox" 
                       ${selectedWaiting.has(index) ? "checked" : ""}
                       onchange="toggleWaitingSelection(${index})"
                       class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/50 transition-all">
                <span class="font-medium text-gray-700 group-hover:text-gray-900 transition-colors">${name}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="deleteWaitingItem(${index})" 
                        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm transition duration-200 shadow-sm hover:shadow flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    삭제
                </button>
            </div>
        `;
        waitingList.appendChild(li);
    });
}

function completeAllParticipants() {
    if (activeParticipants.length === 0) {
        return;
    }

    // 현재 참여자 모두 제거
    activeParticipants = [];

    // 대기자들 중에서 MAX_ACTIVE_PARTICIPANTS만큼만 이동
    while (
        activeParticipants.length < MAX_ACTIVE_PARTICIPANTS &&
        waitingParticipants.length > 0
    ) {
        activeParticipants.push(waitingParticipants.shift());
    }

    selectedWaiting.clear();
    updateLists();
}

function toggleWaitingSelection(index) {
    if (selectedWaiting.has(index)) {
        selectedWaiting.delete(index);
    } else {
        selectedWaiting.add(index);
    }
    updateLists();
}

function toggleAllWaiting() {
    if (selectedWaiting.size === waitingParticipants.length) {
        // 모두 선택된 상태면 전체 해제
        selectedWaiting.clear();
    } else {
        // 아니면 전체 선택
        selectedWaiting = new Set(waitingParticipants.map((_, index) => index));
    }
    updateLists();
}

function deleteSelectedWaiting() {
    if (selectedWaiting.size === 0) return;

    // 선택된 인덱스를 배열로 변환하고 내림차순 정렬
    const selectedIndices = Array.from(selectedWaiting).sort((a, b) => b - a);

    // 큰 인덱스부터 삭제 (배열 인덱스 변화 방지)
    selectedIndices.forEach((index) => {
        waitingParticipants.splice(index, 1);
    });

    // 선택 목록 초기화
    selectedWaiting.clear();
    updateLists();
}

function deleteWaitingItem(index) {
    waitingParticipants.splice(index, 1);
    selectedWaiting.clear();
    updateLists();
}
