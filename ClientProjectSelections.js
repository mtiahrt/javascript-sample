"use strict";
function ClientProjectSelectionsComponent (){
    this.projectComponent = new ProjectComponent();
}
ClientProjectSelectionsComponent.prototype.createClientProjectSelectionsDiv = function(){
    const returnValue = document.createElement('div');
    returnValue.classList.add('client-project-selections');
    this.clientProjectSelections = returnValue;
    return returnValue;
}
ClientProjectSelectionsComponent.prototype.createProjectDiv = function(){
    return this.projectComponent.createProjectDiv();
}
ClientProjectSelectionsComponent.prototype.createProjectRow = function(projectId, projectName){
    this.projectComponent.projectId = projectId;
    const row = this.projectComponent.createSelectedProjectsTR(projectName, projectId);
    return row;
}
ClientProjectSelectionsComponent.prototype.createClientDropdownDiv = function(includeLoadingOption) {
    const clientDropdown = document.createElement('div');
    clientDropdown.classList.add('client-dropdown');
    const dropDownLabel = document.createElement('label');
    dropDownLabel.textContent = 'Client';
    dropDownLabel.htmlFor = 'clientSelect';
    this.clientSelectElement = document.createElement('select');
    this.clientSelectElement.id = 'clientSelect';
    this.clientSelectElement.onchange = handleClientChangeEvent;
    this.clientSelectElement.classList.add('form-control','form-control-sm','client-select');
    if(includeLoadingOption){
        this.clientSelectElement.add(createLoadingOption());
    }
    const minusButton = document.createElement('i');
    minusButton.onclick = handleClientMinusClickEvent
    minusButton.classList.add('fa', 'fa-minus-circle','fa-lg','client-minus');
    clientDropdown.appendChild(dropDownLabel);
    clientDropdown.appendChild(this.clientSelectElement)
    clientDropdown.appendChild(minusButton);
    return clientDropdown;
}
ClientProjectSelectionsComponent.prototype.loadClientDropdown = function (response, includeAllOption) {
    if(includeAllOption){
        this.addAllOptionToClientDropDown(this.clientSelectElement);
    }
    populateSelectElement(response.clients.data, this.clientSelectElement, 'name');
}
ClientProjectSelectionsComponent.prototype.loadClientDropdownFromOptions = function(previousSelectOptions){
    //god rights should only be available on the first client selection
    const godOption = [...previousSelectOptions].find(x => x.className ==='god-rights');
    if(godOption){
        godOption.remove()
    }
    previousSelectOptions.forEach(option => this.clientSelectElement.options.add(option));
    this.clientSelectElement.selectedIndex = 0;
}
ClientProjectSelectionsComponent.prototype.addAllOptionToClientDropDown = function(){  
    const allOption = [...this.clientSelectElement.options].find(option => option.classList.contains('god-rights'));
    if(!allOption){
        const allOption = document.createElement("option");
        allOption.classList.add('god-rights');
        allOption.textContent = 'All';
        this.clientSelectElement.add(allOption, 1);
    }
}
