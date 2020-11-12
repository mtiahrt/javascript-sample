//this file builds the project access div for adding and removing clients and their projects
// here is a blank markup example for reference
//**********************************************************************************************************

//<div class="project-access hidden-fields">
//    <div class="client-project-selections">
//        <div class="client-dropdown">
//            <label for="clientSelect">Client</label>
//            <select id="clientSelect" onchange="handleClientChangeEvent(this)" class="form-control form-control-sm client-select"></select>
//            <i onclick="handleClientMinusClickEvent(this)" class="fa fa-minus-circle fa-lg client-minus"></i>
//        </div>
//        <div class="project hidden-fields">
//            <table>
//                <thead class="hidden-fields">
//                    <tr>
//                        <th>Project</th>
//                        <th colspan="2">Role</th>
//                    </tr>
//                </thead>
//                <tbody class="selected-projects enabled"></tbody>
//            </table>
//            <i class="fa fa-plus-circle fa-lg project-plus" id="projectPlusButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//                Project
//            </i>
//            <div onclick="handleProjectPlusDropdownClickEvent(this)" class="dropdown-menu project-dropdown" aria-labelledby="projectPlusButton"></div>
//        </div>
//    </div>
//    <div class="add-client">
//        <i onclick="handleClientPlusClickEvent(this)" class="fa fa-plus-circle fa-lg client-plus"></i> Client
//    </div>
//</div>
//end of example

"use strict";
//Event handlers
const handleProjectAccessClickEvent = e => {
    loadClientProjectRolesModal();
}
const handleClientChangeEvent = e => {
    setupProjectsDropdown(e.currentTarget);
}
const handleClientPlusClickEvent = e => {
    addClientProjectSelections(e.target);
}
const handleClientMinusClickEvent = e => {
    removeClientProjectSelections(e.target);
}
const handleProjectPlusDropdownClickEvent = e => {
    if (e.currentTarget.id === 'projectPlusButton') {
        return;
    }
    addNewProjectRowToDom(e.target);
}
const handleProjectMinusClickEvent = e => {
    removeProjectRoleRowElement(e);
}
const handleSelectedItemsChange = e=> {
    fadeRow(e.target.closest('tr'));
}
const handleDoneClickEvent = e => {
    saveClientsProjects(e);
}
const handleCancelClickEvent = e => {
    cancelModalChanges();
}
const handleGodRightsDeclineClick = (e) => {
    dismissGodRightsElement(e.target);
}
const handleGodRightsAcceptClick = (e) => {
    acceptingGodRights(e);
}
//end of event handlers

const cancelModalChanges = () => {
    $('#usersModal').modal('hide');
}
const dismissGodRightsElement = e => {
    const element = e.closest('.god-rights');
    slideUpElement(element, () => {
        slideDownElement(e.closest(selector.projectAccess.CLIENT_PROJECT_SELECTIONS).querySelector('.project'));
        element.remove();
    });
}
const validateProjectAccessSelections = () => {
    //clear previous validation results
    document.querySelectorAll('.modal .modal-body select.invalid')
        .forEach(select => select.classList.remove('invalid'));
    let isValid = true;
    //************check that all dropdowns have a value**************
    const allSelects = [...document.querySelectorAll('.modal .modal-body select')]
    const emptySelects = allSelects.filter(select => select.options[select.selectedIndex].value === '');
    if(emptySelects.length > 0){
        isValid = false;
        emptySelects.forEach(select => select.classList.add('invalid'));
        displayValidationMessageInModal('One or more dropdowns are empty.  Please pick an option or remove this item.');
    }
    //*********check for dups**********
    //get all the selected options
    const selectedOptions = [...document.querySelectorAll('.modal .modal-body select option:checked')];
    //get the ids
    const selectedIds = selectedOptions.map(item => item.dataset.id);
    const dupSelections = selectedIds.filter((item, index) => selectedIds.indexOf(item) != index)
        .filter((value, index, self) => self.indexOf(value) === index);
    if(dupSelections.length > 0){
        isValid = false;
        //get the dup select elements and set to invalid
        selectedOptions.filter(item => dupSelections.includes(item.dataset.id))
            .forEach(option => option.parentElement.classList.add('invalid'));
            displayValidationMessageInModal('Duplucation in selections exist.  Please evaluate.');
    }
    return isValid;
}
const saveClientsProjects = () => {
    const isValid = validateProjectAccessSelections();
    if(isValid){
        //first select the workspace data 
        let workspaces = [];
        const selectedProjects = document.querySelectorAll(selector.projectAccess.CLIENT_PROJECT_SELECTIONS + ' .selected-projects tr');
        if(selectedProjects.length > 0){
            //create the workspace object
            selectedProjects.forEach(projectRow => {
                let selectedRow = {id: projectRow.attributes.item('project-id').value, 
                                   name: projectRow.firstElementChild.textContent};
                selectedRow.groups = {};
                const option = projectRow.querySelector('select option:checked');
                selectedRow.groups.id = option.id;
                selectedRow.groups.name = option.textContent;
                workspaces.push(selectedRow);
            });
            //put the values in the workspaces hidden fields
            let workspaceValues = {};
            workspaces.forEach((item, index) => {
                let clientDropDown = selectedProjects[index].closest(selector.projectAccess.CLIENT_PROJECT_SELECTIONS).querySelector(selector.projectAccess.CLIENT_DROPDOWN);
                workspaceValues[item.id] = {};
                workspaceValues[item.id].id = item.id;
                //set client id
                workspaceValues[item.id].clientId = clientDropDown.options[clientDropDown.selectedIndex].id
                workspaceValues[item.id].name = item.name;
                workspaceValues[item.id].groups = {};
                workspaceValues[item.id].groups[item.groups.id] = item.groups.name;
            });
            document.querySelector(selector.manageUsers.USER_DETAIL_USER_SAVE_VALUES + ' .workspaces').value = JSON.stringify(workspaceValues);
            toggleUserDetailButtonsDisabled();
            enableSaveButton();
            disableUserTable();           
        }
        $('#usersModal').modal('hide');
    }
}
const fadeRow = (row) => {
    row.classList.remove(commonSelectors.HIDDEN_FIELDS,'new-row')
}
const loadClientProjectRolesModal = () => {
    //check if user has a workspace already.
    let currentWorkspace = document.querySelector(selector.manageUsers.USER_DETAIL_USER_SAVE_VALUES + ' .workspaces').value;
    currentWorkspace === '' ? currentWorkspace = {} : currentWorkspace = JSON.parse(currentWorkspace);
    if(Object.keys(currentWorkspace).length > 0){
        loadModal(currentWorkspace);
        return;
    }
    createEmptyModal();
}
const createEmptyModal = () => {
    //get clients
    getClients().then(data => {
        clientProjSeleComponent.loadClientDropdown(data, true);
    });
    const projectAccessComponent = new ProjectAccessComponent();
    const projectAccessDiv = projectAccessComponent.createProjectAccessDiv();
    const clientProjSeleComponent = new ClientProjectSelectionsComponent();
    const clientProjSelcElement = clientProjSeleComponent.createClientProjectSelectionsDiv();
    clientProjSelcElement.appendChild(clientProjSeleComponent.createClientDropdownDiv(true));
    clientProjSelcElement.appendChild(clientProjSeleComponent.createProjectDiv());
    projectAccessDiv.appendChild(clientProjSelcElement);
    projectAccessDiv.appendChild(projectAccessComponent.createAddClientDiv());
    renderProjectAccessModal(projectAccessDiv); 
}
const getModalTitle = () => {
    return `<h6 class="text-primary">Project Access</h6>`;
}
const getModalFooter = () => {
    return `<button onclick="handleCancelClickEvent(this)" type="button" class="btn btn-secondary">Cancel</button>
    <button onclick="handleDoneClickEvent(this)" type="button" class="btn btn-primary">Done</button>`
}
const renderProjectAccessModal = body => {
    const title = getModalTitle();
    const footer = getModalFooter();
    const clientRolesModal = modal.getEmptyModal('usersModal', title, footer, true, true);
    clientRolesModal.querySelector('.modal-body').appendChild(body);
    //add modal to dom
    document.querySelector('body').appendChild(appendModalContainerElement(clientRolesModal));
    //display it
    $('#usersModal').modal();
    $('#usersModal').on('hidden.bs.modal', function (e) {
        removeModalFromDOM();
      })
}
const loadModal = workspaces => {
    //first get all clients. load them once they come back
    getClients().then(response => {
        projectAccessComponent.loadAllClientDropdowns(response);
        //set the selected options for client dropdown
        projectAccessComponent.clientComponents.forEach((clientComponent, index) => {
            setSelectedIndex(clientComponent.clientSelectElement, 'id', modalDOMMap[index].clientId)
        });
    });
    //build the array of objects in UI order
    const modalDOMMap = createUIFriendlyArray(workspaces);
    const projectAccessComponent = new ProjectAccessComponent();
    let apiResponses = [];
    modalDOMMap.forEach((client, index) => {
        apiResponses = [];
        //get all the workspaces
        apiResponses.push(getProjects(client.clientId));
        //get all roles for each workspace
        client.workspaces.forEach(workspace => {
            apiResponses.push(getRole(workspace.id));
        });
        Promise.all(apiResponses).then(responses => {
            const currentClientComponent = projectAccessComponent.clientComponents[index];
            //get a list of the previously selected project ids
            const excludeTheseIds = currentClientComponent.projectComponent.projectRows.map(row => row.attributes['project-id'].value);
            //load the remaining workspaces
            currentClientComponent.projectComponent.loadComponent(responses, excludeTheseIds);
            client.workspaces.forEach(workspace => {
                const row = currentClientComponent.projectComponent.projectRows.find(y => {
                    return y.attributes['project-id'].value === workspace.id
                });
                setSelectedIndex(row.querySelector('select'),'id', workspace.groups.id);
            });
        });
    });
    //while waiting on API responses build shell DOM object and render it
    buildEmptyProjectAccessDOMObject(modalDOMMap, projectAccessComponent);
}
const buildEmptyProjectAccessDOMObject = (modalDOMMap, projectAccessComponent) => {
    const projectAccessDiv = projectAccessComponent.createProjectAccessDiv();
    modalDOMMap.forEach(client => {
        const clientComponent = new ClientProjectSelectionsComponent(client.clientId);
        const clientProjectSelectionsEle = clientComponent.createClientProjectSelectionsDiv();
        clientProjectSelectionsEle.appendChild(clientComponent.createClientDropdownDiv(true));
        clientProjectSelectionsEle.appendChild(clientComponent.createProjectDiv());
        //build the project rows dom elements
        client.workspaces.forEach(workspace => {
            clientProjectSelectionsEle.querySelector('.project tbody.selected-projects').appendChild(clientComponent.createProjectRow(workspace.id, workspace.name));
        });
        projectAccessComponent.addClientComponent(clientComponent);
        projectAccessDiv.appendChild(clientProjectSelectionsEle);
    });
    projectAccessDiv.appendChild(projectAccessComponent.createAddClientDiv());
    //add modal to dom
    renderProjectAccessModal(projectAccessDiv);
    
}
const appendModalContainerElement = (element) =>{
    const modalContainerElement = document.createElement('div');
    modalContainerElement.id = 'modalContainer';
    modalContainerElement.appendChild(element);
    return modalContainerElement;
}
const setSelectedIndex = (selectElement, valueAttribute, value) => {
    const selectedOption = [...selectElement.options].find(x => x.dataset[valueAttribute] === value);
    if(selectedOption){
        selectElement.selectedIndex = selectedOption.index;
    }
}
const createUIFriendlyArray = workspaces => {
    const allValues = Object.values(workspaces);
    //create an object that reflects the UI not the backend object which is confusing
    //get unique list client guids
    var distinctClientIds = [...new Set(allValues.map(x => x.clientId))];
    //get all objects for each client guid
    const returnValue = distinctClientIds.map(item => {
        return {
            clientId: item, 
            workspaces: allValues.filter(valuesItem => valuesItem.clientId === item).map(item => {
                const ids = Object.keys(item.groups);
                if(ids.length < 1){
                    item.groups = {};
                }else{
                    item.groups = {
                        id: ids[0], 
                        name: item.groups[ids[0]]
                    };
                }
                return item;
            })
        }
    });
    return returnValue;
}
const acceptingGodRights = e => {
    showNotification(notificationType.warning, 'Full Access', 'Clicking save will grant this user full access to all clients and projects');
    document.querySelector('.user-detail .user-save-values .is-god-access').value = true;
    document.querySelector('.user-detail .user-save-values .workspaces').value = '';
    removeModalFromDOM();
}
const renderAllAccessConfirmationElement = () => {
    //create the dom element
    const parentDiv = document.createElement('div');
    parentDiv.classList.add('god-rights',commonSelectors.HIDDEN_FIELDS);
    const boldMessage = document.createElement('h4');
    boldMessage.textContent = 'I understand that i am granting access to all clients and all projects.'
    parentDiv.appendChild(boldMessage);
    const buttonDiv = document.createElement('div');
    buttonDiv.classList.add('buttons');
    const declineButton = document.createElement('button');
    declineButton.classList.add('decline','btn','btn-secondary');
    declineButton.onclick = handleGodRightsDeclineClick
    declineButton.textContent = 'Decline';
    const acceptButton = document.createElement('button');
    acceptButton.classList.add('accept','btn','btn-danger');
    acceptButton.setAttribute('data-dismiss','modal');
    acceptButton.textContent = 'Accept';
    acceptButton.onclick = handleGodRightsAcceptClick
    buttonDiv.appendChild(declineButton);
    buttonDiv.appendChild(acceptButton);
    parentDiv.appendChild(buttonDiv);
    //add to the modal
    document.querySelector(selector.projectAccess.CLIENT_PROJECT_SELECTIONS).appendChild(parentDiv);
    slideDownElement(parentDiv);
}
const setupProjectsDropdown = e => {
    if(e[e.selectedIndex].textContent === ''){
        return
    }
    //check if all is selected first
    if(e[e.selectedIndex].textContent === 'All') {
        toggleHiddenFieldsClass(document.querySelector(selector.projectAccess.PROJECT_ACCESS + ' .add-client'));
        toggleHiddenFieldsClass(document.querySelector('.modal .project'));
        renderAllAccessConfirmationElement();
        return;
    }
    getProjects(e[e.selectedIndex].id).then(projects => {
        projectComponent.loadProjectDropdown(projects);
    });
    const projectComponent = new ProjectComponent();
    if(e.closest(selector.projectAccess.CLIENT_PROJECT_SELECTIONS)){
        projectComponent.projectDropdown = e.closest(selector.projectAccess.CLIENT_PROJECT_SELECTIONS).querySelector(selector.projectAccess.PROJECT_DROPDOWN);
    }
}
const getProjects = clientId =>{
    return getData(`/api/user/workspaceByClient/${clientId}`);
}
const getClients = () => {
    return getData('/api/user/Clients');
}
const getRole = projectId => {
    return getData(`/api/user/GroupsByworkspace/${projectId}`)
}
const removeProjectRoleRowElement = e => {
    //add option back to project dropdown list
    const row = e.target.closest('tr');
    const project = {};
    project.workspaces = {};
    project.workspaces.data = [{id: row.getAttribute('project-id'),
                            name: row.querySelector('.project-name').textContent}];
    const projectComponent = new ProjectComponent();
    projectComponent.projectDropdown = e.target.closest('.project').querySelector(selector.projectAccess.PROJECT_DROPDOWN);
    projectComponent.loadProjectDropdown(project);
    //remove row
    e.target.closest('tr').remove();
}
const addNewProjectRowToDom = target => {
    const id = target.attributes['data-id'].value;
    getRole(id).then(data => {
        projectComponent.loadProjectRow(data, row);
    });
    //build the project row element
    const projectComponent = new ProjectComponent();
    const row = projectComponent.createSelectedProjectsTR(target.textContent, id);
    target.closest('.project').querySelector('tbody').appendChild(row);
    target.remove();
};

const removeClientProjectSelections = e => {
    //check if this is the only client selection class excluding the hidden one (template)
    if (document.querySelectorAll(selector.projectAccess.CLIENT_PROJECT_SELECTIONS).length === 1) {
        const clientProjSeleComponent = new ClientProjectSelectionsComponent();
        clientProjSeleComponent.projectComponent.projectDropdown = document.querySelector(selector.projectAccess.PROJECT_DROPDOWN);
        clientProjSeleComponent.clientSelectElement = document.querySelector(selector.projectAccess.CLIENT_DROPDOWN);
        clientProjSeleComponent.addAllOptionToClientDropDown();
        //add the options back to the drop down
        const selectedItems = document.querySelectorAll(selector.projectAccess.SELECTED_PROJECTS);
        const addBackList = {};
        addBackList.workspaces = {};
        addBackList.workspaces.data = [...selectedItems]
            .map(item => ({id: item.attributes.item('project-id').value, name: item.firstChild.textContent}));
        clientProjSeleComponent.projectComponent.loadProjectDropdown(addBackList);
        //remove all project rows and enable client dropdown then exit
        selectedItems.forEach(div => div.remove());
        return;
    }
    //select nearest client-project-selections class
    const clientProjectSelections = e.closest(selector.projectAccess.CLIENT_PROJECT_SELECTIONS);  
    slideUpElement(clientProjectSelections, () => {clientProjectSelections.remove()});
}
//called by handleClientPlusClickEvent 
const addClientProjectSelections = e => {
    //build it
    const clientProjSeleComponent = new ClientProjectSelectionsComponent();
    const clientProjSeleDiv = clientProjSeleComponent.createClientProjectSelectionsDiv();
    clientProjSeleDiv.appendChild(clientProjSeleComponent.createClientDropdownDiv(false));
    clientProjSeleDiv.appendChild(clientProjSeleComponent.createProjectDiv());
    //load the options from the pervious client dropdown saving a API call
    const previousSelectElement = document.querySelector('.modal .add-client')
        .previousSibling.querySelector(selector.projectAccess.CLIENT_DROPDOWN);
    if(previousSelectElement && previousSelectElement.selectedOptions && previousSelectElement.selectedOptions.length > 0){
        let selectedId;
        previousSelectElement.selectedOptions.item(0) ? selectedId = previousSelectElement.selectedOptions.item(0).id : selectedId = '';
        clientProjSeleComponent.loadClientDropdownFromOptions(previousSelectElement.querySelectorAll(`option:not([data-id = "${selectedId}"])`));
    }
    const parentNode = document.querySelector(selector.projectAccess.PROJECT_ACCESS);
    parentNode.insertBefore(clientProjSeleDiv, parentNode.lastChild);
    slideDownElement(clientProjSeleDiv);
}

