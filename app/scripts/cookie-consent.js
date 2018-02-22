$(function() {
    $(document).euCookieLawPopup().init({
    cookiePolicyUrl : 'https://www.cookielaw.org/faq/#Whatsthecookielawallabout',
    popupPosition : 'bottom',
    colorStyle : 'default',
    compactStyle : true,
    popupTitle : 'This website is using cookies',
    popupText : 'Google serves cookies to analyse traffic to this site. Information about your use of our site is shared with Google for that purpose.',
    buttonContinueTitle : 'Continue',
    buttonLearnmoreTitle : 'Learn&nbsp;more',
    buttonLearnmoreOpenInNewWindow : true,
    agreementExpiresInDays : 30,
    autoAcceptCookiePolicy : false,
    htmlMarkup : null
  });
});