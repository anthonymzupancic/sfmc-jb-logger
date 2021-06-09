define([
    'postmonger'
], function(
    Postmonger
) {
    'use strict';

    let connection = new Postmonger.Session();
    let authTokens = {};
    let payload = {};
    let interactionRes = {};
    let dataSourcesRes = {};

    // Steps of Activity
    var lastStepEnabled = false;
    const steps = [
        { "label": "Configure Message", "key": "step1" },
        { "label": "Configure Logging", "key": "step2" }
    ]

    // Set first step
    let currentStep = steps[0].key;

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedInteraction', onRequestedInteraction);
    connection.on('requestedTriggerEventDefinition', onRequestedTriggerEventDefinition);
    connection.on('requestedDataSources', onRequestedDataSources);

    connection.on('clickedNext', save);

    function onRender() {
        // JB will respond the first time 'ready' is called with 'initActivity'
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
        connection.trigger('requestInteraction');
        connection.trigger('requestTriggerEventDefinition');
        connection.trigger('requestDataSources');

        /*
            Add functionality for Message Textarea
            Inserts personalization at curser point
        */
        $('#personalization').on('click', '.personalization_option', function() {
            console.log("clicked")
            console.log($(this).data("value"));
            let selected = $(this).data("value");
            let message = $("#message")
            let messageVal = message.val()
            let position = message.prop("selectionStart");

            let messageStart = messageVal.substring(0, position)
            let messageEnd = messageVal.substring(position)

            let inserted = `${messageStart} ${selected} ${messageEnd}`
            console.log(inserted)
            message.val(inserted)
        })



    }

    function onRequestedDataSources(dataSources) {
        console.log('*** requestedDataSources ***');
        console.log(dataSources);

        const event = dataSources.filter(e => e.id === 'Event')
        const fields = event[0].deSchema.fields;
        const eventDefinitionKey = event[0].eventDefinitionKey;

        let options = '';
        fields.forEach((field) => {
            options += `<li id="${field.id}" class="personalization_option" data-value="{{${event[0].keyPrefix}${field.name}}}">${field.name}</li>`
        })

        $('#personalization').html(options);
    }

    function onRequestedInteraction(interaction) {
        console.log('*** requestedInteraction ***');
        console.log(interaction);

        interactionRes = interaction
    }

    function onRequestedTriggerEventDefinition(eventDefinitionModel) {
        console.log('*** requestedTriggerEventDefinition ***');
        console.log(eventDefinitionModel);
    }

    function initialize(data) {
        console.log(data);
        if (data) {
            payload = data;
        }

        var hasInArguments = Boolean(
            payload['arguments'] &&
            payload['arguments'].execute &&
            payload['arguments'].execute.inArguments &&
            payload['arguments'].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload['arguments'].execute.inArguments : {};

        console.log('*** in arguments ***')
        console.log(inArguments);

        if (inArguments && inArguments.length > 0 && inArguments[0].message) {
            $('#message').val(inArguments[0].message)
        }


        // Disable the next button if a value isn't entered
        $('#message').change(function() {
            var message = getMessage();

            if (message) {
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'next',
                    visible: true,
                    enabled: Boolean(message)
                });
            }
            // } else {
            //     connection.trigger('updateButton', {
            //         button: 'next',
            //         text: 'done',
            //         visible: true
            //     });
            // }

        });
    }

    function onGetTokens(tokens) {
        console.log(tokens);
        authTokens = tokens;
    }

    function onGetEndpoints(endpoints) {
        console.log(endpoints);
    }

    function save() {
        // set fields based on user input
        let message = $('#message').val();
        payload['arguments'].execute.inArguments[0] = {
            'message': message,
            'toPhone': interactionRes.defaults.mobileNumber[0]
        }

        payload['metaData'].isConfigured = true;

        console.log(payload);
        connection.trigger('updateActivity', payload);
    }


    /*
        Step Control Functions
    */
    function onClickedNext() {
        if (currentStep.key === 'step1') {
            if (validateStep1())
                showStep(null, 2)
            connection.trigger('nextStep');
            else
                connection.trigger('ready');
        } else {
            save();
        }
    }

    function validateStep1() {
        let valid = false;

        //Check for message length
        let hasMessage = $('#message').val().length > 1 ? true : false;

        if (hasMessage)
            valid = true

        return valid
    }


    function onClickedBack() {
        connection.trigger('prevStep');
    }

    function onGotoStep(step) {
        showStep(step);
        connection.trigger('ready');
    }

    function showStep(step, stepIndex) {
        if (stepIndex && !step) {
            step = steps[stepIndex - 1];
        }

        currentStep = step;

        $('.step').hide();

        switch (currentStep.key) {
            case 'step1':
                $('#step1').show();
                connection.trigger('updateButton', {
                    button: 'next',
                    enabled: Boolean(getMessage())
                });
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: false
                });
                break;
            case 'step2':
                $('#step2').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                connection.trigger('updateButton', {
                    button: 'next',
                    text: 'next',
                    visible: true
                });
                break;
            case 'step3':
                $('#step3').show();
                connection.trigger('updateButton', {
                    button: 'back',
                    visible: true
                });
                if (lastStepEnabled) {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'next',
                        visible: true
                    });
                } else {
                    connection.trigger('updateButton', {
                        button: 'next',
                        text: 'done',
                        visible: true
                    });
                }
                break;
        }
    }

    function getMessage() {
        console.log($("#message").val())
        return $("#message").val()
    }

});