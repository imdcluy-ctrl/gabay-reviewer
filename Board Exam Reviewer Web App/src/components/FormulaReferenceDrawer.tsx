import React, { useState } from 'react';
import './FormulaReferenceDrawer.css';

interface FormulaReferenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulaReferenceDrawer: React.FC<FormulaReferenceDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'numerical' | 'verbal' | 'general'>('numerical');

  if (!isOpen) return null;

  return (
    <div className="formula-drawer-overlay" onClick={onClose}>
      <div className="formula-drawer-container" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="formula-drawer-header">
          <div className="formula-drawer-title">
            <span className="formula-drawer-icon">📐</span>
            <h3>Civil Service High-Yield Reference Sheet</h3>
          </div>
          <button className="formula-drawer-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="formula-drawer-tabs">
          <button
            className={`formula-tab ${activeTab === 'numerical' ? 'active' : ''}`}
            onClick={() => setActiveTab('numerical')}
          >
            🔢 Numerical Formulas
          </button>
          <button
            className={`formula-tab ${activeTab === 'verbal' ? 'active' : ''}`}
            onClick={() => setActiveTab('verbal')}
          >
            ✍️ Grammar & Prepositions
          </button>
          <button
            className={`formula-tab ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            🇵🇭 Constitution & RA 6713
          </button>
        </div>

        {/* Content Sheet */}
        <div className="formula-drawer-content">
          {activeTab === 'numerical' ? (
            <div className="reference-cards-grid">
              <div className="reference-card">
                <h4>🚗 Distance, Rate & Time</h4>
                <div className="formula-box">D = R × T  •  R = D / T  •  T = D / R</div>
                <ul className="formula-notes">
                  <li><strong>Average Speed (Equal Distance):</strong> (2 × R1 × R2) / (R1 + R2)</li>
                  <li><em>Tip: Convert hours to minutes if rate is in mins!</em></li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>⏱️ Work Rate Formula</h4>
                <div className="formula-box">1/A + 1/B = 1/Total  ➜  Total = (A × B) / (A + B)</div>
                <ul className="formula-notes">
                  <li>Combined work rate is sum of individual hourly/daily rates.</li>
                  <li><strong>3 Workers:</strong> 1/A + 1/B + 1/C = 1/Total</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>📊 Percentage, Profit & Loss</h4>
                <div className="formula-box">P = R × B  •  % Change = [(New - Old) / Old] × 100%</div>
                <ul className="formula-notes">
                  <li><strong>Markup %:</strong> [(Selling Price - Cost) / Cost] × 100%</li>
                  <li><strong>Discount Price:</strong> Original Price × (1 - Discount Rate)</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>⚖️ Ratio & Inverse Proportion</h4>
                <div className="formula-box">Direct: x1/y1 = x2/y2  •  Inverse: x1 × y1 = x2 × y2</div>
                <ul className="formula-notes">
                  <li><strong>Inverse Example:</strong> More workers = fewer days needed.</li>
                  <li><strong>Ratio Parts:</strong> Sum parts (e.g. 2:3 = 5 total parts).</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>📈 Number Series & Sequences</h4>
                <div className="formula-box">Arithmetic: an = a1 + (n - 1)d</div>
                <ul className="formula-notes">
                  <li><strong>Sum of Arithmetic Series:</strong> Sn = (n / 2) × (a1 + an)</li>
                  <li><strong>Geometric Sequence:</strong> an = a1 × r^(n - 1)</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>👴 Age Problem Equations</h4>
                <div className="formula-box">Past (-X yrs)  •  Present (X)  •  Future (+Y yrs)</div>
                <ul className="formula-notes">
                  <li>Set up a table for each person across Past, Present, and Future.</li>
                  <li>Example: "In 5 years, A is twice B" ➜ (A + 5) = 2(B + 5).</li>
                </ul>
              </div>
            </div>
          ) : activeTab === 'verbal' ? (
            <div className="reference-cards-grid">
              <div className="reference-card">
                <h4>📌 Preposition Rules & Common Traps</h4>
                <div className="formula-box">Responsible TO vs FOR  •  Different FROM</div>
                <ul className="formula-notes">
                  <li><strong>Responsible TO:</strong> A person/superior (e.g. "to the Director").</li>
                  <li><strong>Responsible FOR:</strong> A duty or task (e.g. "for managing sales").</li>
                  <li><strong>Different FROM:</strong> Always use "from", never "different than".</li>
                  <li><strong>Composed OF:</strong> Correct. "Comprise" does NOT take "of".</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>📌 Subject-Verb Agreement Rules</h4>
                <div className="formula-box">Intervening Phrases Rule</div>
                <ul className="formula-notes">
                  <li>Phrases like <em>"along with", "as well as", "together with"</em> do NOT change subject number.</li>
                  <li>Example: "The Mayor, along with his aides, <strong>is</strong> arriving."</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>📌 Neither/Nor & Either/Or Rule</h4>
                <div className="formula-box">Proximity Rule</div>
                <ul className="formula-notes">
                  <li>Verb agrees with the subject closest to it.</li>
                  <li>Example: "Neither the teacher nor the <strong>students were</strong> present."</li>
                  <li>Example: "Neither the students nor the <strong>teacher was</strong> present."</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>📌 Indefinite Pronouns</h4>
                <div className="formula-box">Always Singular Pronouns</div>
                <ul className="formula-notes">
                  <li><em>Each, Every, Anyone, Someone, Everyone, Neither, Either</em> take SINGULAR verbs.</li>
                  <li>Example: "Each of the candidates <strong>has</strong> submitted a resume."</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>🔗 Verbal Analogy Relationships</h4>
                <div className="formula-box">Bridge Sentence Technique</div>
                <ul className="formula-notes">
                  <li><strong>Worker : Tool:</strong> Carpenter : Saw :: Surgeon : Scalpel</li>
                  <li><strong>Part : Whole:</strong> Leaf : Tree :: Page : Book</li>
                  <li><strong>Cause : Effect:</strong> Drought : Famine :: Infection : Fever</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="reference-cards-grid">
              <div className="reference-card">
                <h4>⚖️ 3 Branches of PH Government</h4>
                <div className="formula-box">Executive • Legislative • Judiciary</div>
                <ul className="formula-notes">
                  <li><strong>Executive:</strong> President & Vice President (Enforces laws - 6yr term).</li>
                  <li><strong>Legislative:</strong> Congress (Senate: 24 Senators, House: District/Partylist - Makes laws).</li>
                  <li><strong>Judiciary:</strong> Supreme Court (1 Chief Justice + 14 Associates - Interprets laws).</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>🇵🇭 1987 Philippine Constitution</h4>
                <div className="formula-box">Article III: Bill of Rights</div>
                <ul className="formula-notes">
                  <li><strong>Due Process & Equal Protection:</strong> Section 1.</li>
                  <li><strong>Search & Seizure Warrants:</strong> Section 2.</li>
                  <li><strong>Miranda Rights (Right to Remain Silent & Counsel):</strong> Section 12.</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>📜 RA 6713: Code of Conduct for Public Officials</h4>
                <div className="formula-box">8 Norms of Conduct</div>
                <ul className="formula-notes">
                  <li>1. Commitment to Public Interest</li>
                  <li>2. Professionalism</li>
                  <li>3. Justness and Sincerity</li>
                  <li>4. Political Neutrality</li>
                  <li>5. Responsiveness to the Public</li>
                  <li>6. Nationalism and Patriotism</li>
                  <li>7. Commitment to Democracy</li>
                  <li>8. Simple Living</li>
                </ul>
              </div>

              <div className="reference-card">
                <h4>🚫 RA 6713 Prohibited Acts & Gifts Rule</h4>
                <div className="formula-box">Zero Solicitation & Conflict of Interest</div>
                <ul className="formula-notes">
                  <li>Public officials cannot solicit gifts or loans in connection with official duties.</li>
                  <li>Must file Statement of Assets, Liabilities, and Net Worth (SALN) annually by April 30.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
