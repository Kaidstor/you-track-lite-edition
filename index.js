const express = require('express');
const dotenv = require('dotenv');
const { default: axios } = require('axios');

dotenv.config();

const app = express();
const port = process.env.PORT;
const baseAPIUrl = process.env.BASE_API_URL;
const baseUrl = process.env.BASE_URL;
const token = process.env.TOKEN;

const config = {
    headers: { Authorization: `Bearer ${token}` }
};

app.use(express.json())

app.get('/', async (req, res) => {
    const response = await axios.get(`${baseAPIUrl}/issueTags/6-5?fields=name,id,issues(id,idReadable,summary,idReadable,customFields(value(localizedName,name),projectCustomField(field(localizedName,name))))`,
    config)

    const issues = await response.data['issues']

    const filteredResult = issues.filter(issue => { 
        for (let customField of issue['customFields']){
            const fieldInfo = customField['projectCustomField']
            if(fieldInfo.field.name === 'State'){
                // console.log(issue.idReadable, customField?.value?.localizedName);
                // console.log(issue.idReadable, customField?.value?.name);
                 
                if (customField?.value?.localizedName === 'Loaded on prod' || 
                customField?.value?.name === 'Done to load on test'){
                    return false
                }
            }

                
            if(fieldInfo?.field?.name === 'Priority')
                issue.priority = customField?.value?.localizedName 
            if(fieldInfo?.field?.name === 'Assignee')
                issue.assignee = customField?.value?.name 
        }
        return true
    })

    let text = `<div style="min-height: 100vh; display: flex; justify-content: center; align-items: center;"><div>`;
    for (let issue of filteredResult){
        text += `
            <p style="margin: 0">${issue.idReadable} [ID${issue.id}] [${issue.priority}] <a href="${baseUrl}/issue/${issue.idReadable}">${issue.summary}</a> => ${issue.assignee || 'Не назначена никому'}</p></br>
        `
    }
    text += '<div></div>'

    return res.send(text)
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});