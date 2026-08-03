export const CLASSIFICATIONS = ['Normal','Watch','Abnormal','Critical','Data issue','Missing data','Not enough information','Explained variation'];
export function safeNumber(value) { return value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) ? null : Number(value); }
export function percentageChange(current, comparison) { const a=safeNumber(current),b=safeNumber(comparison);return a===null||b===null||b===0?null:(a-b)/b*100; }
export function classifyConsumption({current,previous,historicalMinimum=null,historicalMaximum=null,dataQualityStatus='',zeroConfirmed=false,reductionVerified=false}) {
  const value=safeNumber(current),prior=safeNumber(previous),minimum=safeNumber(historicalMinimum),maximum=safeNumber(historicalMaximum),quality=String(dataQualityStatus||'').toLowerCase(),bad=['missing','invalid','broken','duplicate','unverified','suspicious','error','pending verification'].some(word=>quality.includes(word));
  if(value===null)return result('Missing data','No consumption value is available for this period.','Review missing readings before comparing consumption.',false);
  if(value<0)return result('Data issue','The recorded consumption is negative and must be corrected before operational conclusions are made.','Review the source reading and calculation.',false);
  if(bad)return result('Data issue','The consumption record has a data-quality or verification issue.','Correct or verify the source data.',false);
  if(value===0&&!zeroConfirmed)return result('Missing data','A zero is recorded but has not been confirmed as genuine operation.','Verify whether the site was shut down or the reading is missing.',false);
  if(prior===null&&minimum===null)return result('Not enough information','There is not enough comparable history to determine whether this value is normal.','Collect and verify more consumption history.',false);
  const percent=percentageChange(value,prior),outside=minimum!==null&&maximum!==null&&(value<minimum||value>maximum);
  if(percent!==null&&percent<=-20&&!reductionVerified)return result('Watch','Reduction not confirmed — incomplete or unverified meter data.','Verify readings and operating conditions before recording a saving.',false);
  if(outside&&percent!==null&&Math.abs(percent)>=50)return result('Critical','Consumption is far outside the available historical range and comparison values.','Validate the data, then investigate if the change remains unexplained.',true);
  if(outside)return result('Abnormal','Consumption is outside the available normal historical range.','Review the contributing site, building, or meter.',true);
  if(percent!==null&&Math.abs(percent)>=15)return result('Watch','Consumption changed materially but remains within the available historical context.','Review operating changes and continue monitoring.',false);
  return result('Normal','Consumption is within the available comparison and historical range.','No immediate action is required.',false);
}
const result=(classification,explanation,actionRecommended,investigationRecommended)=>({classification,explanation,actionRecommended,investigationRecommended});
export function displayMetric(value,{suffix='',digits=1}={}){const number=safeNumber(value);return number===null?'Not available':`${new Intl.NumberFormat('en-AE',{maximumFractionDigits:digits}).format(number)}${suffix}`;}
export function debounce(fn,delay=300){let timer;return(...args)=>{clearTimeout(timer);timer=setTimeout(()=>fn(...args),delay)};}
