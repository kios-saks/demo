import type {Pool} from "pg";
import type {MockContentDataset} from "../../../../packages/data/src/contracts.js";
import {normalizeSearch} from "../../../../packages/data/src/postgres-repository.js";
/**
 * Idempotent seed: inserts missing rows only. NEVER overwrites a CMS edit or a reviewer decision.
 * Entire batch is one SQL transaction; no truncation or destructive resets.
 */
export async function seedDatabase(pool:Pool,data:MockContentDataset):Promise<void>{
  if(data.articles.some(a=>a.status!=="draft")||data.researchCards.some(c=>c.status!=="draft"))
    throw new Error("Refusing to seed non-draft demo content");
  const client=await pool.connect();
  try{
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(604212023)");
    for(const [key,value] of Object.entries({seededAt:data.seededAt,version:data.version,disclaimer:data.disclaimer})){
      await client.query("INSERT INTO app_settings(key,value) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING",[key,JSON.stringify(value)]);
    }
    for(const s of data.stages)await client.query(`INSERT INTO knowledge_stages(slug,title,icon,range_label,description,sort_order)
      VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,[s.slug,s.title,s.icon,s.range,s.description,s.order]);
    for(const topic of data.topics){
      await client.query("INSERT INTO knowledge_topics(id,data) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING",[topic.id,JSON.stringify(topic)]);
      for(const stage of topic.stageSlugs)await client.query(
        "INSERT INTO knowledge_topic_stages(topic_id,stage_slug) VALUES($1,$2) ON CONFLICT DO NOTHING",[topic.id,stage]);
    }
    for(const src of data.sources){
      await client.query("INSERT INTO knowledge_sources(id,data) VALUES($1,$2::jsonb) ON CONFLICT DO NOTHING",[src.id,JSON.stringify(src)]);
      for(const stage of src.stageSlugs)await client.query(
        "INSERT INTO knowledge_source_stages(source_id,stage_slug) VALUES($1,$2) ON CONFLICT DO NOTHING",[src.id,stage]);
    }
    for(const article of data.articles){
      await client.query(`INSERT INTO knowledge_articles(slug,stage_slug,sort_order,status,search_text,payload)
        VALUES($1,$2,$3,'draft',$4,$5::jsonb) ON CONFLICT DO NOTHING`,[
        article.slug,article.stage,article.order,normalizeSearch([article.title,article.summary,...article.tags].join(" ")),JSON.stringify(article)
      ]);
      await client.query(`INSERT INTO editorial_revisions(article_slug,revision,snapshot,editor_id)
        VALUES($1,1,$2::jsonb,'seed-import') ON CONFLICT DO NOTHING`,[article.slug,JSON.stringify(article)]);
    }
    for(const card of data.researchCards){
      await client.query(`INSERT INTO knowledge_research_cards(id,stage_slug,topic_id,data)
        VALUES($1,$2,$3,$4::jsonb) ON CONFLICT DO NOTHING`,[card.id,card.stageSlug,card.topicId,JSON.stringify(card)]);
      for(const sourceId of card.sourceIds)await client.query(
        "INSERT INTO knowledge_card_sources(card_id,source_id) VALUES($1,$2) ON CONFLICT DO NOTHING",[card.id,sourceId]);
    }
    await client.query("COMMIT");
  }catch(e){await client.query("ROLLBACK");throw e;}finally{client.release();}
}
