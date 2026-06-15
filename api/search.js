export default async function handler(req,res){

try{

const { query } = req.query;

const response = await fetch(
`https://simple-api-lagi.vercel.app/api/search/ytsearch?query=${encodeURIComponent(query)}`
);

const data = await response.json();

return res.status(200).json(data);

}catch(e){

return res.status(500).json({
status:false,
error:e.message
});

}

}
