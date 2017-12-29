interface SelectorMap {
	"#buttonButtonCenterer": HTMLDivElement;
	"#buttonButtonContainer": HTMLDivElement;
	"#buttonSpinner": HTMLDivElement;
	"#buttonText": HTMLDivElement;
	"#confirmName": HTMLButtonElement;
	"#errorText": HTMLDivElement;
	"#inviteLinkButton": HTMLDivElement;
	"#inviteLinkResult": HTMLDivElement;
	"#inviteLinkResultInput": HTMLPaperInputElement;
	"#inviteLinkSpinner": HTMLDivElement;
	"#mainButton": HTMLDivElement;
	"#nameInput": HTMLInputElement;
	"#networkStatus": HTMLDivElement;
	"#notificationButton": HTMLDivElement;
	"#notificationsActive": SVGElement;
	"#notificationsDisabled": SVGElement;
	"#registerDialog": HTMLDivElement;
	"#registerInput": HTMLPaperInputElement;
	"#registerNameInput": HTMLInputElement;
	"#requestOpenButton": HTMLButtonElement;
	"#sendInviteLink": HTMLButtonElement;
	"#sendInviteLinkDialog": HTMLDivElement;
	"#sendInviteLinkDialogButton": HTMLDivElement;
	"#showExpandedFabs": HTMLDivElement;
	"#spinnerCircle": HTMLDivElement;
	".backdrop": HTMLDivElement;
	".blue": HTMLPaperInputElement;
	".button": HTMLDivElement;
	".buttonBottomFloater": HTMLDivElement;
	".buttonCenterer": HTMLDivElement;
	".buttonContainer": HTMLDivElement;
	".buttonHorizontalCenterer": HTMLDivElement;
	".buttonSpinnerContainer": HTMLDivElement;
	".buttonSpinnerSpinner": HTMLDivElement;
	".buttonSpinnerText": HTMLDivElement;
	".deurOpenTextCenterer": HTMLDivElement;
	".dialog": HTMLDivElement;
	".dialogContent": HTMLDivElement;
	".dialogTitle": HTMLDivElement;
	".dialogs": HTMLDivElement;
	".expandFab": HTMLDivElement;
	".fabContent": SVGElement;
	".fabs": HTMLDivElement;
	".fancyButton": HTMLButtonElement;
	".fancyRadioButton": HTMLDivElement;
	".fancyRadioButtonContainer": HTMLDivElement;
	".fancyRadioButtonVerticalCenterer": HTMLDivElement;
	".focused-underline": HTMLDivElement;
	".hidden": HTMLDivElement;
	".horizontalCenterer": HTMLDivElement;
	".iAm": HTMLDivElement;
	".iAmInput": HTMLDivElement;
	".iNeed": HTMLDivElement;
	".inlineHorizontalCenterer": HTMLDivElement;
	".input": HTMLInputElement;
	".inputCont": HTMLPaperInputElement;
	".is-active": HTMLDivElement;
	".main": HTMLDivElement;
	".otherInput": HTMLDivElement;
	".overlays": HTMLDivElement;
	".pageCenterer": HTMLDivElement;
	".pageContainer": HTMLDivElement;
	".radioButtonInnerDot": HTMLDivElement;
	".radioButtonText": HTMLDivElement;
	".radioButtons": HTMLDivElement;
	".raised": HTMLDivElement;
	".sectionSeperator": HTMLDivElement;
	".sectionTitle": HTMLDivElement;
	".topBar": HTMLDivElement;
	".underline": HTMLDivElement;
	".unfocused-underline": HTMLDivElement;
	".verticalCenterer": HTMLDivElement;
	".visible": HTMLDivElement;
}

interface IDMap {
	"buttonButtonCenterer": HTMLDivElement;
	"buttonButtonContainer": HTMLDivElement;
	"buttonSpinner": HTMLDivElement;
	"buttonText": HTMLDivElement;
	"confirmName": HTMLButtonElement;
	"errorText": HTMLDivElement;
	"inviteLinkButton": HTMLDivElement;
	"inviteLinkResult": HTMLDivElement;
	"inviteLinkResultInput": HTMLPaperInputElement;
	"inviteLinkSpinner": HTMLDivElement;
	"mainButton": HTMLDivElement;
	"nameInput": HTMLInputElement;
	"networkStatus": HTMLDivElement;
	"notificationButton": HTMLDivElement;
	"notificationsActive": SVGElement;
	"notificationsDisabled": SVGElement;
	"registerDialog": HTMLDivElement;
	"registerInput": HTMLPaperInputElement;
	"registerNameInput": HTMLInputElement;
	"requestOpenButton": HTMLButtonElement;
	"sendInviteLink": HTMLButtonElement;
	"sendInviteLinkDialog": HTMLDivElement;
	"sendInviteLinkDialogButton": HTMLDivElement;
	"showExpandedFabs": HTMLDivElement;
	"spinnerCircle": HTMLDivElement;
}

interface ClassMap {
	"backdrop": HTMLDivElement;
	"blue": HTMLPaperInputElement;
	"button": HTMLDivElement;
	"buttonBottomFloater": HTMLDivElement;
	"buttonCenterer": HTMLDivElement;
	"buttonContainer": HTMLDivElement;
	"buttonHorizontalCenterer": HTMLDivElement;
	"buttonSpinnerContainer": HTMLDivElement;
	"buttonSpinnerSpinner": HTMLDivElement;
	"buttonSpinnerText": HTMLDivElement;
	"deurOpenTextCenterer": HTMLDivElement;
	"dialog": HTMLDivElement;
	"dialogContent": HTMLDivElement;
	"dialogTitle": HTMLDivElement;
	"dialogs": HTMLDivElement;
	"expandFab": HTMLDivElement;
	"fabContent": SVGElement;
	"fabs": HTMLDivElement;
	"fancyButton": HTMLButtonElement;
	"fancyRadioButton": HTMLDivElement;
	"fancyRadioButtonContainer": HTMLDivElement;
	"fancyRadioButtonVerticalCenterer": HTMLDivElement;
	"focused-underline": HTMLDivElement;
	"hidden": HTMLDivElement;
	"horizontalCenterer": HTMLDivElement;
	"iAm": HTMLDivElement;
	"iAmInput": HTMLDivElement;
	"iNeed": HTMLDivElement;
	"inlineHorizontalCenterer": HTMLDivElement;
	"input": HTMLInputElement;
	"inputCont": HTMLPaperInputElement;
	"is-active": HTMLDivElement;
	"main": HTMLDivElement;
	"otherInput": HTMLDivElement;
	"overlays": HTMLDivElement;
	"pageCenterer": HTMLDivElement;
	"pageContainer": HTMLDivElement;
	"radioButtonInnerDot": HTMLDivElement;
	"radioButtonText": HTMLDivElement;
	"radioButtons": HTMLDivElement;
	"raised": HTMLDivElement;
	"sectionSeperator": HTMLDivElement;
	"sectionTitle": HTMLDivElement;
	"topBar": HTMLDivElement;
	"underline": HTMLDivElement;
	"unfocused-underline": HTMLDivElement;
	"verticalCenterer": HTMLDivElement;
	"visible": HTMLDivElement;
}

interface ModuleMap {}

interface TagMap {}

interface NodeSelector {
	querySelector<T extends keyof SelectorMap>(selector: T): SelectorMap[T];
	querySelectorAll<T extends keyof SelectorMap>(selector: T): SelectorMap[T][];
}

interface Document {
	getElementById<T extends keyof IDMap>(elementId: T): IDMap[T];
	getElementsByClassName<T extends keyof ClassMap>(classNames: string): HTMLCollectionOf<ClassMap[T]>
	getElementsByTagName<T extends keyof TagMap>(tagName: T): NodeListOf<TagMap[T]>;
}

type ModuleIDs<T extends keyof ModuleMap> = ModuleMap[T];