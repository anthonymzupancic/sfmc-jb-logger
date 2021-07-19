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
    let journeyName = ''

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

        var currentField = '';
        $('#loggingFields').on('click', '.field', function() {
            currentField = $(this).attr('id')
        })


        /*
            Add functionality for Message Textarea
            Inserts personalization at curser point
        */
        $('#personalization').on('click', '.personalization_option', function() {
            console.log("clicked")
            console.log($(this).data("value"));
            console.log('*** currentField ***')
            console.log(currentField)
            let selected = $(this).data("value");
            let field = $(`#${currentField}`)
            console.log(field)

            console.log(selected)
            field.val(selected)
        })


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
                        html += '<p class="text-danger">';
                        html += 'There was an issue getting the logging Data Extension.';
                        html += '</p>';

                        $('#loggingFields').append(html)
                    } else {
                        let html = '';

                        data.Results.forEach((field) => {
                            let fieldName = field.Name;
                            let isPrimaryKey = field.IsPrimaryKey;
                            let fieldType = field.FieldType;

                            html += '<div class="form-group mt-3">';

                            if (fieldType === 'Text' || fieldType === 'EmailAddress') {
                                html += '<label>' + fieldName + '</label>';
                                html += '<input class="w-full-textarea field" name="' + fieldName + '" id="' + fieldName + '" />';
                            }

                            html += '</div>'
                        })

                        $('#loggingFields').append(html)
                    }
                });
        })

        $('#saveSchema').click(function() {
            let html = $('#loggingFields')
            console.log(html[0].innerHTML)
            localStorage.setItem('schemaHTML', html[0].innerHTML)
        })

        $('#clearSchema').click(function() {
            localStorage.removeItem('schemaHTML')
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

        journeyName = interaction.name;

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

        let storedSchema = localStorage.getItem('schemaHTML')
        if (storedSchema) {
            $('#loggingFields').append(storedSchema)
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
        // let exitCode = $('#exitCode').val();

        // payload['arguments'].execute.inArguments[0] = {
        //     'exitCode': exitCode,
        //     'sourceFields': sourceFieldsArgs
        // }

        //Add configured Fields to args array
        let args = []
        $('#loggingFields :input').each(function() {
            args.push({
                name: $(this).attr('id'),
                value: $(this).val()
            })
        })

        //Add Journey name to Args array
        args.push({
            name: 'JourneyName',
            value: journeyName
        })

        payload['arguments'].execute.inArguments[0] = {
            'logging': args,
            'sourceFields': sourceFieldsArgs
        }

        payload['metaData'].isConfigured = true;

        console.log(payload);
        connection.trigger('updateActivity', payload);
    }

});