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
    let sourceFieldsArgs = [];


    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('requestedTokens', onGetTokens);
    connection.on('requestedEndpoints', onGetEndpoints);
    connection.on('requestedInteraction', onRequestedInteraction);
    connection.on('requestedTriggerEventDefinition', onRequestedTriggerEventDefinition);
    connection.on('requestedDataSources', onRequestedDataSources);

    connection.on('clickedNext', save);

    // connection.on('clickedNext', onClickedNext);
    // connection.on('clickedBack', onClickedBack);
    // connection.on('gotoStep', onGotoStep);

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
*/

        $('#getSchema').on('click', function() {
            let loggingDE = $('#loggingDE').val();

            console.log('get schema clicked')
            console.log(loggingDE)

            $.ajax({
                    method: "POST",
                    url: "https://twilio-integration-dev.herokuapp.com/journeybuilder/getLoggingSchema",
                    data: {
                        loggingDE: loggingDE
                    }
                })
                .done(function(data) {
                    console.log(data);

                    if (!data.Results) {
                        html = ''
                        html += '<div class="form-group">';
                        html += '<input class="w-full-textarea" name="exitCode" id="exitCode" />';
                        html += '</div>';

                        $('#loggingFields').html(html)
                    } else {
                        html = '';


                        data.Results.forEach((field) => {
                            let fieldName = field.Name;
                            let isPrimaryKey = field.IsPrimaryKey;
                            let fieldType = field.FieldType;

                            html += '<div class="form-group">';

                            if (fieldType === 'Text') {
                                html += '<input class="w-full-textarea" name="' + fieldName + '" id="' + fieldName + '" />';
                            }

                            html += '</div>'
                        })
                    }
                });
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

            let fieldSchema = {
                fieldName: `${field.name}`,
                binding: `{{${event[0].keyPrefix}${field.name}}}`
            }

            sourceFieldsArgs.push(fieldSchema)

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

        if (inArguments && inArguments.length > 0 && inArguments[0].exitCode) {
            $('#exitCode').val(inArguments[0].exitCode)
        }

        connection.trigger('updateButton', {
            button: 'next',
            text: 'done',
            visible: true
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
        let exitCode = $('#exitCode').val();

        payload['arguments'].execute.inArguments[0] = {
            'exitCode': exitCode,
            'sourceFields': sourceFieldsArgs
        }

        payload['metaData'].isConfigured = true;

        console.log(payload);
        connection.trigger('updateActivity', payload);
    }

});