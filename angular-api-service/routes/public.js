const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth');
const email = require('../controllers/email');
const emailTemplate = require('../controllers/emailTemplate');
const user = require('../controllers/user');
const extension = require('../controllers/extension');
const extensionDashboard = require('../controllers/extensionDashboard');
const paytm = require('../controllers/paytm');
const softPhone = require('../controllers/softphone');
const apiIntegration = require('../controllers/api_integration.js');
const validateRequest = require('../middleware/validateRequest');
const loginSchema = require('../validateRequestSchema/loginSchema');

//auth
router.route('/auth/login').post(validateRequest.validateBodyRequest(loginSchema), auth.login);
// router.route('/auth/updatePassword/user').put(auth.updatePassword);
router.route('/auth/emailExist').post(auth.emailExist); //Not apply jwt token
router.route('/sendmail').post(email.sendmail); //Not apply jwt token because of multiple params
// router.route('/auth/getMenuListForOcPbx').post(auth.getMenuListForOcPbx);
router.route('/auth/getHistory').post(auth.getHistory); // Not apply in Project
// router.route('/auth/makeNotificationAsRead').post(auth.makeNotificationAsRead);
router.route('/auth/getIP').get(auth.getSystemIP); // Not apply jwt token

// //get email template info
// router.route('/emailTemplate/createEmailTemplate').post(emailTemplate.createEmailTemplate);
// router.route('/emailTemplate/viewEmailTemplate').post(emailTemplate.viewEmailTemplate);
// router.route('/emailTemplate/deleteEmailTemplate').post(emailTemplate.deleteEmailTemplate);
// router.route('/emailTemplate/updateEmailTemplateStatus').put(emailTemplate.updateEmailTemplateStatus);
// router.route('/emailTemplate/getEmailContentUsingCategory').get(emailTemplate.getEmailContentUsingCategory);
// router.route('/emailTemplate/checkExistedCategory').get(emailTemplate.checkExistedCategory);
// router.route('/emailTemplate/getEmailTemplateByFilters').post(emailTemplate.getEmailTemplateByFilters);
// router.route('/emailTemplate/checkMultipleStatus').post(emailTemplate.checkMultipleStatus);
// router.route('/emailTemplate/countEmailTemplate').get(emailTemplate.countEmailTemplate);
// router.route('/emailTemplate/getProductEmailCategory').get(emailTemplate.getProductEmailCategory);

// router.route('/user/getCustomerName').get(user.getCustomerName);
// router.route('/user/getCustomerNameandEmail').get(user.getCustomerNameandEmail);
// router.route('/user/getCustomerEmail').get(user.getCustomerEmail);
router.route ('/user/resetPassword').post(user.resetPassword);

// router.route('/extension/getExtensionName').get(extension.getExtensionName);
// router.route('/extension/extensionEmailExist').post(extension.extensionEmailExist);
// router.route('/extension/getCustomerExtensionFeatures').get(extension.getCustomerExtensionFeatures);
// router.route('/extension/getExtensionFeaturesByFilters').post(extension.getExtensionFeaturesByFilters);


//show extension dashboard data
// router.route('/extensionDashboard/getExtensionDashboardSpeeddial').get(extensionDashboard.getExtensionDashboardSpeeddial);
// router.route('/extensionDashboard/getExtensionDashboardCallForward').get(extensionDashboard.getExtensionDashboardCallForward);
// router.route('/extensionDashboard/getExtensionDashboardFeatures').get(extensionDashboard.getExtensionDashboardFeatures);
// router.route('/extensionDashboard/getExtensionDashboardVoiceMail').get(extensionDashboard.getExtensionDashboardVoiceMail);


// router.route('/extensionDashboard/getExtensionDashboardSpeeddial').get(extensionDashboard.getExtensionDashboardSpeeddial);
  // router.route('/paytm/callback').post(paytm.getPaytmCallback); // Not used in project

// Softphone logs
// router.route('/softPhone/login').post(softPhone.login); // Not used in project
// router.route('/softPhone/location').post(softPhone.location); // Not used in project
// router.route('/softPhone/customerInfo').post(softPhone.createSoftPhoneLogs); // Not used in project

router.route('/getProductProfile').get(user.getProductLogo); // not apply jwt token due to lending page

// router.route('/api_integration').post(apiIntegration.api_integration); // Not used in project


module.exports = router;    