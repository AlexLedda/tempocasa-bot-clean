# TWILIO WEBHOOK FIX - Codice da aggiungere a server.py su Render
# 
# ISTRUZIONI:
# 1. Su Render, vai al tuo backend
# 2. Trova il file server.py
# 3. Cerca la funzione @api_router.post("/whatsapp/webhook")
# 4. Sostituisci TUTTA la funzione whatsapp_webhook con il codice qui sotto

"""
# WhatsApp webhook endpoint - Twilio compatible
@api_router.post("/whatsapp/webhook")
async def whatsapp_webhook(request: Request):
    try:
        # Parse form data from Twilio
        form_data = await request.form()
        
        # Extract Twilio fields
        phone_number = form_data.get("From", "").replace("whatsapp:", "")
        message = form_data.get("Body", "")
        
        if not phone_number or not message:
            return Response(
                content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
                media_type="application/xml"
            )
        
        # Check if client has previous messages
        existing_messages = await db.messages.count_documents({"client_phone": phone_number})
        
        # Save incoming message
        msg = MessageCreate(
            client_phone=phone_number,
            message=message,
            direction="incoming"
        )
        await create_message(msg)
        
        # If existing client, just save, don't respond
        if existing_messages > 0:
            return Response(
                content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
                media_type="application/xml"
            )
        
        # Get or create client
        client = await db.clients.find_one({"phone": phone_number})
        if not client:
            new_client = ClientCreate(
                name=f"Cliente {phone_number[-4:]}",
                surname="",
                phone=phone_number,
                profile_completed=False
            )
            await create_client(new_client)
            client = await db.clients.find_one({"phone": phone_number})
        
        # Get AI response
        try:
            ai_response = await get_ai_response(message, phone_number, client)
            
            # Update client if needed
            if ai_response.get("update_client"):
                await db.clients.update_one(
                    {"phone": phone_number},
                    {"$set": ai_response["update_client"]}
                )
            
            # Save AI response
            response_msg = MessageCreate(
                client_phone=phone_number,
                message=ai_response["response"],
                direction="outgoing",
                client_name=client.get('name') if client else None
            )
            await create_message(response_msg)
            
            # Return TwiML response
            twiml = f'<?xml version="1.0" encoding="UTF-8"?><Response><Message>{ai_response["response"]}</Message></Response>'
            return Response(content=twiml, media_type="application/xml")
            
        except Exception as e:
            logging.error(f"AI response error: {e}")
            twiml = '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Ciao! Un nostro agente ti contatterà presto.</Message></Response>'
            return Response(content=twiml, media_type="application/xml")
            
    except Exception as e:
        logging.error(f"Webhook error: {e}")
        return Response(
            content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            media_type="application/xml"
        )
"""
